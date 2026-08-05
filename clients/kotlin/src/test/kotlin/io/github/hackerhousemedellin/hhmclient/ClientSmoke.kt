package io.github.hackerhousemedellin.hhmclient

fun main() {
    var observed: ClientRequest? = null
    val client = Client("https://api.example.com/", "secret", Transport { request ->
        observed = request
        ClientResponse(200, "{\"ok\":true}")
    })
    check(client.health() == "{\"ok\":true}")
    check(observed?.method == "GET")
    check(observed?.uri.toString() == "https://api.example.com/healthz")
    check(observed?.headers?.get("authorization") == "Bearer secret")
    println("kotlin client contract ok")
}
