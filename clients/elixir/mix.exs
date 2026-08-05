defmodule HackerHouseMedellinClient.MixProject do
  use Mix.Project
  def project, do: [app: :hhm_client, version: "0.1.0", elixir: "~> 1.16", deps: []]
  def application, do: [extra_applications: [:inets, :ssl]]
end
