# frozen_string_literal: true
require "json"
require "net/http"
require "uri"

class HackerHouseMedellinClient
  def initialize(base_url:, token: nil)
    @base_url = base_url.sub(%r{/+$}, "")
    @token = token
  end

  def request(method, path, body: nil)
    uri = URI("#{@base_url}/#{path.sub(%r{^/+}, "")}")
    req = Net::HTTP.const_get(method.to_s.capitalize).new(uri)
    req["Authorization"] = "Bearer #{@token}" if @token
    req["Content-Type"] = "application/json" if body
    req.body = JSON.generate(body) if body
    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == "https") { |http| http.request(req) }
    raise "Hacker House Medellín request failed: #{response.code}" unless response.is_a?(Net::HTTPSuccess)
    response.body.nil? || response.body.empty? ? nil : JSON.parse(response.body)
  end
end
