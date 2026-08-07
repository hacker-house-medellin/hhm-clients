<?php

declare(strict_types=1);

namespace HackerHouseMedellin\Client;

use RuntimeException;

final class ApiException extends RuntimeException
{
    public function __construct(public readonly int $status, public readonly mixed $body)
    {
        parent::__construct("request failed: {$status}");
    }
}

final class ServiceClient
{
    public function __construct(private string $baseUrl, private ?string $token = null)
    {
        if ($baseUrl === '') throw new \InvalidArgumentException('baseUrl is required');
        $this->baseUrl = rtrim($baseUrl, '/');
    }
    public function health(): mixed { return $this->request('/healthz'); }
    public function ready(): mixed { return $this->request('/readyz'); }
    public function config(): mixed { return $this->request('/api/config'); }
    public function emitEvent(mixed $payload): mixed { return $this->request('/api/events', 'POST', $payload); }
    public function createLead(mixed $payload): mixed { return $this->request('/api/leads', 'POST', $payload); }
    public function createAlert(mixed $payload): mixed { return $this->request('/api/alerts', 'POST', $payload); }

    public function request(string $path, string $method = 'GET', mixed $body = null): mixed
    {
        $headers = ['accept: application/json'];
        if ($this->token !== null) $headers[] = "authorization: Bearer {$this->token}";
        $content = null;
        if ($body !== null) {
            $headers[] = 'content-type: application/json';
            $content = json_encode($body, JSON_THROW_ON_ERROR);
        }
        $context = stream_context_create(['http' => ['method' => $method, 'header' => implode("\r\n", $headers), 'content' => $content, 'ignore_errors' => true]]);
        $raw = file_get_contents($this->baseUrl . '/' . ltrim($path, '/'), false, $context);
        $status = 0;
        if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $match)) $status = (int) $match[1];
        $parsed = $raw === false || $raw === '' ? null : json_decode($raw, true, flags: JSON_THROW_ON_ERROR);
        if ($status < 200 || $status >= 300) throw new ApiException($status, $parsed);
        return $parsed;
    }
}
