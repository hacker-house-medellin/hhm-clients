package io.github.hackerhousemedellin.hhmclient;

public final class ClientContractTest {
    public static void main(String[] args) {
        final Client.Request[] observed = new Client.Request[1];
        Client client = new Client("https://api.example.com/", "secret", request -> {
            observed[0] = request;
            return new Client.Response(200, "{\"ok\":true}");
        });
        String response = client.health();
        if (!"{\"ok\":true}".equals(response)) throw new AssertionError(response);
        if (!"GET".equals(observed[0].method())) throw new AssertionError(observed[0].method());
        if (!"https://api.example.com/healthz".equals(observed[0].uri().toString())) throw new AssertionError(observed[0].uri());
        if (!"Bearer secret".equals(observed[0].headers().get("authorization"))) throw new AssertionError(observed[0].headers());
        System.out.println("java client contract ok");
    }
}
