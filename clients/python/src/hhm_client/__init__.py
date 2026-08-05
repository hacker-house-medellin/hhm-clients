from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Callable, Mapping
from urllib.request import Request, urlopen
from urllib.error import HTTPError

Transport = Callable[[str, str, Mapping[str, str], bytes | None, float], tuple[int, bytes]]


class ClientError(RuntimeError):
    def __init__(self, status: int, body: bytes) -> None:
        super().__init__(f"HTTP {status}: {body.decode('utf-8', errors='replace')}")
        self.status = status
        self.body = body


@dataclass(slots=True)
class Client:
    base_url: str
    token: str | None = None
    timeout: float = 10.0
    transport: Transport | None = None

    def __post_init__(self) -> None:
        self.base_url = self.base_url.rstrip("/")
        if self.transport is None:
            self.transport = self._default_transport

    def health(self) -> Any:
        return self.request("GET", "/healthz")

    def get_config(self) -> Any:
        return self.request("GET", "/api/config")

    def emit_event(self, payload: Any) -> Any:
        return self.request("POST", "/api/events", payload)

    def emit_alert(self, payload: Any) -> Any:
        return self.request("POST", "/api/alerts", payload)

    def request(self, method: str, path: str, payload: Any | None = None) -> Any:
        headers = {"accept": "application/json"}
        if self.token:
            headers["authorization"] = f"Bearer {self.token}"
        body = None
        if payload is not None:
            headers["content-type"] = "application/json"
            body = json.dumps(payload, separators=(",", ":")).encode()
        assert self.transport is not None
        status, raw = self.transport(method, self.base_url + path, headers, body, self.timeout)
        if status < 200 or status >= 300:
            raise ClientError(status, raw)
        if not raw:
            return None
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return raw.decode("utf-8")

    @staticmethod
    def _default_transport(method: str, url: str, headers: Mapping[str, str], body: bytes | None, timeout: float) -> tuple[int, bytes]:
        request = Request(url, data=body, headers=dict(headers), method=method)
        try:
            with urlopen(request, timeout=timeout) as response:  # nosec B310: caller controls the API base URL intentionally
                return response.status, response.read()
        except HTTPError as error:
            return error.code, error.read()


__all__ = ["Client", "ClientError", "Transport"]
