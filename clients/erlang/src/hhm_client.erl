-module(hhm_client).
-export([endpoint/2, health/1, config/1]).

endpoint(Base0, Path0) ->
    Base = string:trim(Base0, trailing, "/"),
    Path = string:trim(Path0, leading, "/"),
    Base ++ "/" ++ Path.
health(Base) -> endpoint(Base, "/healthz").
config(Base) -> endpoint(Base, "/api/config").
