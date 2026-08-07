package com.hackerhousemedellin.client;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Objects;

public final class ServiceClient {
    public static final class ApiException extends RuntimeException {
        public final int status;
        public final String body;
        public ApiException(int status, String body) { super("request failed: " + status); this.status = status; this.body = body; }
    }
    private final String baseUrl;
    private final String token;
    private final HttpClient http;

    public ServiceClient(String baseUrl, String token) {
        this(baseUrl, token, HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NEVER).build());
    }
    public ServiceClient(String baseUrl, String token, HttpClient http) {
        if (baseUrl == null || baseUrl.isBlank()) throw new IllegalArgumentException("baseUrl is required");
        this.baseUrl = baseUrl.replaceFirst("/$", "");
        this.token = token;
        this.http = Objects.requireNonNull(http, "http");
    }
    public String health() throws IOException, InterruptedException { return request("/healthz", "GET", null); }
    public String ready() throws IOException, InterruptedException { return request("/readyz", "GET", null); }
    public String config() throws IOException, InterruptedException { return request("/api/config", "GET", null); }
    public String emitEvent(String json) throws IOException, InterruptedException { return request("/api/events", "POST", json); }
    public String createLead(String json) throws IOException, InterruptedException { return request("/api/leads", "POST", json); }
    public String createAlert(String json) throws IOException, InterruptedException { return request("/api/alerts", "POST", json); }
    public String request(String path, String method, String jsonBody) throws IOException, InterruptedException {
        HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create(baseUrl + "/" + path.replaceFirst("^/", ""))).header("accept", "application/json");
        if (token != null && !token.isBlank()) builder.header("authorization", "Bearer " + token);
        if (jsonBody == null) builder.method(method, HttpRequest.BodyPublishers.noBody());
        else builder.header("content-type", "application/json").method(method, HttpRequest.BodyPublishers.ofString(jsonBody));
        HttpResponse<String> response = http.send(builder.build(), HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) throw new ApiException(response.statusCode(), response.body());
        return response.body();
    }
}
