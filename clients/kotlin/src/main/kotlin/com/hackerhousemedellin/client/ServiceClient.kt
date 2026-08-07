package com.hackerhousemedellin.client

import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse

class ApiException(val status: Int, val responseBody: String) : RuntimeException("request failed: $status")

class ServiceClient(
    baseUrl: String,
    private val token: String? = null,
    private val http: HttpClient = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NEVER).build(),
) {
    private val baseUrl = baseUrl.trimEnd('/').also { require(it.isNotBlank()) { "baseUrl is required" } }
    fun health() = request("/healthz")
    fun ready() = request("/readyz")
    fun config() = request("/api/config")
    fun emitEvent(json: String) = request("/api/events", "POST", json)
    fun createLead(json: String) = request("/api/leads", "POST", json)
    fun createAlert(json: String) = request("/api/alerts", "POST", json)
    fun request(path: String, method: String = "GET", jsonBody: String? = null): String {
        val builder = HttpRequest.newBuilder(URI.create("$baseUrl/${path.trimStart('/')}"))
            .header("accept", "application/json")
        token?.takeIf { it.isNotBlank() }?.let { builder.header("authorization", "Bearer $it") }
        if (jsonBody == null) builder.method(method, HttpRequest.BodyPublishers.noBody())
        else builder.header("content-type", "application/json").method(method, HttpRequest.BodyPublishers.ofString(jsonBody))
        val response = http.send(builder.build(), HttpResponse.BodyHandlers.ofString())
        if (response.statusCode() !in 200..299) throw ApiException(response.statusCode(), response.body())
        return response.body()
    }
}
