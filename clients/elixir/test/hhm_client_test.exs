defmodule HhmClientTest do
  use ExUnit.Case, async: true

  test "injects bearer authentication and preserves the API path" do
    parent = self()
    transport = fn method, url, headers, body ->
      send(parent, {method, url, headers, body})
      {:ok, 200, ~s({"ok":true})}
    end

    client = HhmClient.new("https://api.example.com/", "secret", transport: transport)
    assert {:ok, _} = HhmClient.health(client)
    assert_receive {:get, "https://api.example.com/healthz", headers, nil}
    assert {"authorization", "Bearer secret"} in headers
  end
end
