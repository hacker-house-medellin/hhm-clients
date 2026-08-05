defmodule HhmClient do
  @moduledoc "HTTP client for the Hacker House Medellín service API."

  defstruct [:base_url, :token]

  def new(base_url, token \\ nil) when is_binary(base_url) do
    %__MODULE__{base_url: String.trim_trailing(base_url, "/"), token: token}
  end

  def health(client), do: request(client, :get, "/healthz")
  def ready(client), do: request(client, :get, "/readyz")
  def config(client), do: request(client, :get, "/api/config")
  def emit_event(client, json), do: request(client, :post, "/api/events", json)
  def create_lead(client, json), do: request(client, :post, "/api/leads", json)
  def create_alert(client, json), do: request(client, :post, "/api/alerts", json)

  def request(%__MODULE__{} = client, method, path, json \\ nil) do
    headers =
      [{~c"accept", ~c"application/json"}]
      |> maybe_authorize(client.token)
      |> maybe_content_type(json)
    url = String.to_charlist(client.base_url <> "/" <> String.trim_leading(path, "/"))
    http_request = if is_nil(json), do: {url, headers}, else: {url, headers, ~c"application/json", json}
    case :httpc.request(method, http_request, [autoredirect: false], [body_format: :binary]) do
      {:ok, {{_, status, _}, _response_headers, body}} when status in 200..299 -> {:ok, body}
      {:ok, {{_, status, _}, _response_headers, body}} -> {:error, %{status: status, body: body}}
      {:error, reason} -> {:error, reason}
    end
  end

  defp maybe_authorize(headers, nil), do: headers
  defp maybe_authorize(headers, token), do: [{~c"authorization", String.to_charlist("Bearer " <> token)} | headers]
  defp maybe_content_type(headers, nil), do: headers
  defp maybe_content_type(headers, _json), do: [{~c"content-type", ~c"application/json"} | headers]
end
