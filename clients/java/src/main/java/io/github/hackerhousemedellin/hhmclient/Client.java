package io.github.hackerhousemedellin.hhmclient;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;

public final class Client {
    public record Request(String method, URI uri, Map<String, String> headers, String body) {}
    public record Response(int statusCode, String body) {}

    @FunctionalInterface
    public interface Transport {
        Response send(Request request) throws Exception;
    }

    public static final class ClientException extends RuntimeException {
        private final int statusCode;
        public ClientException(int statusCode, String body) {
            super("HTTP " + statusCode + ": " + body);
            this.statusCode = statusCode;
        }
        public int statusCode() { return statusCode; }
    }

    private final String baseUrl;
    private final String token;
    private final Transport transport;

    public Client(String baseUrl, String token) { this(baseUrl, token, defaultTransport()); }
    public Client(String baseUrl, String token, Transport transport) {
        this.baseUrl = Objects.requireNonNull(baseUrl).replaceAll("/+$", "");
        this.token = token;
        this.transport = Objects.requireNonNull(transport);
    }

    public String health() { return request("GET", "/healthz", null); }
    public String getConfig() { return request("GET", "/api/config", null); }
    public String emitEvent(String json) { return request("POST", "/api/events", json); }
    public String emitAlert(String json) { return request("POST", "/api/alerts", json); }

    public String request(String method, String path, String body) {
        var headers = new LinkedHashMap<String, String>();
        headers.put("accept", "application/json");
        if (token != null && !token.isBlank()) headers.put("authorization", "Bearer " + token);
        if (body != null) headers.put("content-type", "application/json");
        try {
            var response = transport.send(new Request(method, URI.create(baseUrl + path), Map.copyOf(headers), body));
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ClientException(response.statusCode(), response.body());
            }
            return response.body();
        } catch (ClientException error) {
            throw error;
        } catch (Exception error) {
            throw new IllegalStateException("client transport failed", error);
        }
    }

    private static Transport defaultTransport() {
        HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
        return request -> {
            var builder = HttpRequest.newBuilder(request.uri()).timeout(Duration.ofSeconds(10));
            request.headers().forEach(builder::header);
            if (request.body() == null) builder.method(request.method(), HttpRequest.BodyPublishers.noBody());
            else builder.method(request.method(), HttpRequest.BodyPublishers.ofString(request.body()));
            HttpResponse<String> response = http.send(builder.build(), HttpResponse.BodyHandlers.ofString());
            return new Response(response.statusCode(), response.body());
        };
    }
}
