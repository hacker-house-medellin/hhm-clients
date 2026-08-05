package io.github.hackerhousemedellin.hhmclient

import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration

data class ClientRequest(val method: String, val uri: URI, val headers: Map<String, String>, val body: String?)
data class ClientResponse(val statusCode: Int, val body: String)
fun interface Transport { fun send(request: ClientRequest): ClientResponse }

class Client(
    baseUrl: String,
    private val token: String? = null,
    private val transport: Transport = defaultTransport(),
) {
    private val baseUrl = baseUrl.trimEnd('/')

    fun health(): String = request("GET", "/healthz")
    fun getConfig(): String = request("GET", "/api/config")
    fun emitEvent(json: String): String = request("POST", "/api/events", json)
    fun emitAlert(json: String): String = request("POST", "/api/alerts", json)

    fun request(method: String, path: String, body: String? = null): String {
        val headers = linkedMapOf("accept" to "application/json")
        if (!token.isNullOrBlank()) headers["authorization"] = "Bearer $token"
        if (body != null) headers["content-type"] = "application/json"
        val response = transport.send(ClientRequest(method, URI.create(baseUrl + path), headers.toMap(), body))
        if (response.statusCode !in 200..299) error("HTTP ${response.statusCode}: ${response.body}")
        return response.body
    }

    companion object {
        private fun defaultTransport(): Transport {
            val http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build()
            return Transport { request ->
                val builder = HttpRequest.newBuilder(request.uri).timeout(Duration.ofSeconds(10))
                request.headers.forEach { (name, value) -> builder.header(name, value) }
                if (request.body == null) builder.method(request.method, HttpRequest.BodyPublishers.noBody())
                else builder.method(request.method, HttpRequest.BodyPublishers.ofString(request.body))
                val response = http.send(builder.build(), HttpResponse.BodyHandlers.ofString())
                ClientResponse(response.statusCode(), response.body())
            }
        }
    }
}
