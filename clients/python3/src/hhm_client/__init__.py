"""Python 3 client for the Hacker House Medellín service API."""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any
from urllib.error import HTTPError
from urllib.request import Request, urlopen


class ApiError(RuntimeError):
    def __init__(self, status: int, body: Any) -> None:
        super().__init__(f"request failed: {status}")
        self.status = status
        self.body = body


@dataclass(slots=True)
class ServiceClient:
    base_url: str
    token: str | None = None
    timeout: float = 30.0

    def __post_init__(self) -> None:
        if not self.base_url: raise ValueError("base_url is required")
        self.base_url = self.base_url.rstrip("/")

    def health(self) -> Any: return self.request("/healthz")
    def ready(self) -> Any: return self.request("/readyz")
    def config(self) -> Any: return self.request("/api/config")
    def emit_event(self, payload: Any) -> Any: return self.request("/api/events", method="POST", body=payload)
    def create_lead(self, payload: Any) -> Any: return self.request("/api/leads", method="POST", body=payload)
    def create_alert(self, payload: Any) -> Any: return self.request("/api/alerts", method="POST", body=payload)

    def request(self, path: str, *, method: str = "GET", body: Any = None) -> Any:
        headers = {"accept": "application/json"}
        if self.token: headers["authorization"] = f"Bearer {self.token}"
        data = None
        if body is not None:
            headers["content-type"] = "application/json"
            data = json.dumps(body).encode()
        request = Request(f"{self.base_url}/{path.lstrip('/')}", data=data, headers=headers, method=method)
        try:
            with urlopen(request, timeout=self.timeout) as response: raw = response.read()
        except HTTPError as error:
            raw = error.read()
            parsed = json.loads(raw) if raw else None
            raise ApiError(error.code, parsed) from error
        return json.loads(raw) if raw else None
