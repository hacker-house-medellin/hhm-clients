defmodule HackerHouseMedellinClient do
  defstruct [:base_url, :token]
  def new(base_url, token \\ nil), do: %__MODULE__{base_url: String.trim_trailing(base_url, "/"), token: token}
  def endpoint(%__MODULE__{base_url: base_url}, path), do: base_url <> "/" <> String.trim_leading(path, "/")
end
