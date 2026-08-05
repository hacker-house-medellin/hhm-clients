from __future__ import annotations

from dataclasses import dataclass
import json
from typing import Any
from urllib import request


@dataclass(frozen=True, slots=True)
class HackerHouseMedellinClient:
    base_url: str
    token: str | None = None

    def request(self, method: str, path: str, body: Any | None = None) -> Any:
        headers = {"Accept": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        payload = None if body is None else json.dumps(body).encode()
        if payload is not None:
            headers["Content-Type"] = "application/json"
        req = request.Request(
            f"{self.base_url.rstrip('/')}/{path.lstrip('/')}",
            data=payload,
            headers=headers,
            method=method.upper(),
        )
        with request.urlopen(req, timeout=30) as response:
            raw = response.read()
            return None if not raw else json.loads(raw)


__all__ = ["HackerHouseMedellinClient"]
