<?php
declare(strict_types=1);

namespace HackerHouseMedellin;

use RuntimeException;

final class Client
{
    public function __construct(private readonly string $baseUrl, private readonly ?string $token = null) {}

    public function request(string $method, string $path, mixed $body = null): mixed
    {
        $headers = ['Accept: application/json'];
        if ($this->token !== null) $headers[] = 'Authorization: Bearer ' . $this->token;
        $content = $body === null ? '' : json_encode($body, JSON_THROW_ON_ERROR);
        if ($body !== null) $headers[] = 'Content-Type: application/json';
        $context = stream_context_create(['http' => ['method' => strtoupper($method), 'header' => implode("\r\n", $headers), 'content' => $content, 'ignore_errors' => true, 'timeout' => 30]]);
        $response = file_get_contents(rtrim($this->baseUrl, '/') . '/' . ltrim($path, '/'), false, $context);
        if ($response === false) throw new RuntimeException('Hacker House Medellín request failed');
        return $response === '' ? null : json_decode($response, true, 512, JSON_THROW_ON_ERROR);
    }
}
