defmodule HhmClient do
  @moduledoc "Dependency-light HTTP client for Hacker House Medellín."

  defstruct [:base_url, :token, :transport]

  @type transport :: (atom(), String.t(), list(), binary() | nil ->
          {:ok, non_neg_integer(), binary()} | {:error, term()})
  @type t :: %__MODULE__{base_url: String.t(), token: String.t() | nil, transport: transport()}

  @spec new(String.t(), String.t() | nil, keyword()) :: t()
  def new(base_url, token \\ nil, opts \\ []) do
    %__MODULE__{
      base_url: String.trim_trailing(base_url, "/"),
      token: token,
      transport: Keyword.get(opts, :transport, &default_transport/4)
    }
  end

  def health(client), do: request(client, :get, "/healthz")
  def get_config(client), do: request(client, :get, "/api/config")
  def emit_event(client, json_body) when is_binary(json_body), do: request(client, :post, "/api/events", json_body)
  def emit_alert(client, json_body) when is_binary(json_body), do: request(client, :post, "/api/alerts", json_body)

  @spec request(t(), atom(), String.t(), binary() | nil) :: {:ok, binary()} | {:error, term()}
  def request(%__MODULE__{} = client, method, path, body \\ nil) do
    headers =
      [{"accept", "application/json"}] ++
        if(client.token, do: [{"authorization", "Bearer " <> client.token}], else: []) ++
        if(body, do: [{"content-type", "application/json"}], else: [])

    case client.transport.(method, client.base_url <> path, headers, body) do
      {:ok, status, response} when status in 200..299 -> {:ok, response}
      {:ok, status, response} -> {:error, {:http_error, status, response}}
      {:error, reason} -> {:error, reason}
    end
  end

  defp default_transport(method, url, headers, body) do
    request_headers = Enum.map(headers, fn {key, value} -> {String.to_charlist(key), String.to_charlist(value)} end)
    request =
      if body do
        {String.to_charlist(url), request_headers, ~c"application/json", body}
      else
        {String.to_charlist(url), request_headers}
      end

    case :httpc.request(method, request, [timeout: 10_000], [body_format: :binary]) do
      {:ok, {{_version, status, _reason}, _headers, response}} -> {:ok, status, response}
      {:error, reason} -> {:error, reason}
    end
  end
end
