<?php

declare(strict_types=1);

namespace HackerHouseMedellin\HhmClient;

use Closure;
use RuntimeException;

final class ClientError extends RuntimeException
{
    public function __construct(public readonly int $status, public readonly string $responseBody)
    {
        parent::__construct("HTTP {$status}: {$responseBody}");
    }
}

final class Client
{
    private readonly Closure $transport;

    public function __construct(
        private readonly string $baseUrl,
        private readonly ?string $token = null,
        ?callable $transport = null,
        private readonly float $timeout = 10.0,
    ) {
        $this->transport = $transport !== null
            ? Closure::fromCallable($transport)
            : Closure::fromCallable([$this, 'defaultTransport']);
    }

    public function health(): mixed { return $this->request('GET', '/healthz'); }
    public function getConfig(): mixed { return $this->request('GET', '/api/config'); }
    public function emitEvent(mixed $payload): mixed { return $this->request('POST', '/api/events', $payload); }
    public function emitAlert(mixed $payload): mixed { return $this->request('POST', '/api/alerts', $payload); }

    public function request(string $method, string $path, mixed $payload = null): mixed
    {
        $headers = ['accept' => 'application/json'];
        if ($this->token !== null) { $headers['authorization'] = 'Bearer ' . $this->token; }
        $body = null;
        if ($payload !== null) {
            $headers['content-type'] = 'application/json';
            $body = json_encode($payload, JSON_THROW_ON_ERROR);
        }
        [$status, $responseBody] = ($this->transport)(
            $method,
            rtrim($this->baseUrl, '/') . $path,
            $headers,
            $body,
            $this->timeout,
        );
        if ($status < 200 || $status >= 300) { throw new ClientError($status, $responseBody); }
        if ($responseBody === '') { return null; }
        return json_decode($responseBody, true, 512, JSON_THROW_ON_ERROR);
    }

    private function defaultTransport(string $method, string $url, array $headers, ?string $body, float $timeout): array
    {
        $headerLines = [];
        foreach ($headers as $name => $value) { $headerLines[] = $name . ': ' . $value; }
        $context = stream_context_create(['http' => [
            'method' => $method,
            'header' => implode("\r\n", $headerLines),
            'content' => $body ?? '',
            'timeout' => $timeout,
            'ignore_errors' => true,
        ]]);
        $response = file_get_contents($url, false, $context);
        $response = $response === false ? '' : $response;
        $status = 0;
        foreach ($http_response_header ?? [] as $line) {
            if (preg_match('/^HTTP\/\S+\s+(\d{3})/', $line, $matches) === 1) { $status = (int) $matches[1]; }
        }
        return [$status, $response];
    }
}
