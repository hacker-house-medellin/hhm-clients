<?php

declare(strict_types=1);

require __DIR__ . '/../src/Client.php';

use HackerHouseMedellin\HhmClient\Client;

$observed = null;
$client = new Client('https://api.example.com/', 'secret', function ($method, $url, $headers, $body, $timeout) use (&$observed) {
    $observed = [$method, $url, $headers, $body, $timeout];
    return [200, '{"ok":true}'];
});
$result = $client->health();
assert($result === ['ok' => true]);
assert($observed[0] === 'GET');
assert($observed[1] === 'https://api.example.com/healthz');
assert($observed[2]['authorization'] === 'Bearer secret');
echo "php client contract ok\n";
