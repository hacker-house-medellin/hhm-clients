# frozen_string_literal: true

require "json"
require "net/http"
require "uri"

class HhmClient
  class ApiError < StandardError
    attr_reader :status, :body
    def initialize(status, body)
      super("request failed: #{status}")
      @status = status
      @body = body
    end
  end

  def initialize(base_url:, token: nil)
    raise ArgumentError, "base_url is required" if base_url.to_s.empty?
    @base_url = base_url.sub(%r{/$}, "")
    @token = token
  end

  def health = request("/healthz")
  def ready = request("/readyz")
  def config = request("/api/config")
  def emit_event(payload) = request("/api/events", method: "POST", body: payload)
  def create_lead(payload) = request("/api/leads", method: "POST", body: payload)
  def create_alert(payload) = request("/api/alerts", method: "POST", body: payload)

  def request(path, method: "GET", body: nil)
    uri = URI("#{@base_url}/#{path.sub(%r{^/}, '')}")
    req = Net::HTTP.const_get(method.capitalize).new(uri)
    req["accept"] = "application/json"
    req["authorization"] = "Bearer #{@token}" if @token
    if body
      req["content-type"] = "application/json"
      req.body = JSON.generate(body)
    end
    response = Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == "https") { |http| http.request(req) }
    parsed = response.body.to_s.empty? ? nil : JSON.parse(response.body)
    raise ApiError.new(response.code.to_i, parsed) unless response.is_a?(Net::HTTPSuccess)
    parsed
  end
end
