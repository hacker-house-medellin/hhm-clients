require "json"
require "net/http"
require "uri"

module HhmClient
  class ClientError < StandardError
    attr_reader :status, :body

    def initialize(status, body)
      @status = status
      @body = body
      super("HTTP #{status}: #{body}")
    end
  end

  class Client
    def initialize(base_url:, token: nil, timeout: 10, transport: nil)
      @base_url = base_url.sub(%r{/+$}, "")
      @token = token
      @timeout = timeout
      @transport = transport || method(:default_transport)
    end

    def health = request(:get, "/healthz")
    def get_config = request(:get, "/api/config")
    def emit_event(payload) = request(:post, "/api/events", payload)
    def emit_alert(payload) = request(:post, "/api/alerts", payload)

    def request(method, path, payload = nil)
      headers = { "accept" => "application/json" }
      headers["authorization"] = "Bearer #{@token}" if @token
      body = nil
      if payload
        headers["content-type"] = "application/json"
        body = JSON.generate(payload)
      end
      status, response_body = @transport.call(method, @base_url + path, headers, body, @timeout)
      raise ClientError.new(status, response_body) unless status.between?(200, 299)
      return nil if response_body.nil? || response_body.empty?
      JSON.parse(response_body)
    rescue JSON::ParserError
      response_body
    end

    private

    def default_transport(method, url, headers, body, timeout)
      uri = URI(url)
      request_class = method == :get ? Net::HTTP::Get : Net::HTTP::Post
      request = request_class.new(uri, headers)
      request.body = body if body
      response = Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == "https", open_timeout: timeout, read_timeout: timeout) do |http|
        http.request(request)
      end
      [response.code.to_i, response.body]
    end
  end
end
