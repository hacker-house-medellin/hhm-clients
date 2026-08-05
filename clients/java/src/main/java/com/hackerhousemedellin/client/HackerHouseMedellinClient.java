package com.hackerhousemedellin.client;

import java.net.URI;
import java.net.http.*;
import java.time.Duration;

public final class HackerHouseMedellinClient {
    private final String baseUrl;
    private final String token;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(30)).build();

    public HackerHouseMedellinClient(String baseUrl, String token) {
        this.baseUrl = baseUrl.replaceAll("/+$", "");
        this.token = token;
    }

    public HttpResponse<String> request(String method, String path, String body) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder().uri(URI.create(baseUrl + "/" + path.replaceFirst("^/+", ""))).header("Accept", "application/json");
        if (token != null && !token.isBlank()) builder.header("Authorization", "Bearer " + token);
        HttpRequest.BodyPublisher publisher = body == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(body);
        if (body != null) builder.header("Content-Type", "application/json");
        return http.send(builder.method(method.toUpperCase(), publisher).build(), HttpResponse.BodyHandlers.ofString());
    }
}
