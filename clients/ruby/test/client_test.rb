require "minitest/autorun"
require "hhm_client"

class ClientContractTest < Minitest::Test
  def test_health_contract
    observed = nil
    transport = lambda do |method, url, headers, body, timeout|
      observed = [method, url, headers, body, timeout]
      [200, '{"ok":true}']
    end
    client = HhmClient::Client.new(base_url: "https://api.example.com/", token: "secret", transport: transport)
    assert_equal({"ok" => true}, client.health)
    assert_equal :get, observed[0]
    assert_equal "https://api.example.com/healthz", observed[1]
    assert_equal "Bearer secret", observed[2]["authorization"]
  end
end
