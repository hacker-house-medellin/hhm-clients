import unittest

from hhm_client import Client, ClientError


class ClientContractTest(unittest.TestCase):
    def test_health_uses_auth_and_normalized_url(self) -> None:
        observed = {}

        def transport(method, url, headers, body, timeout):
            observed.update(method=method, url=url, headers=headers, body=body, timeout=timeout)
            return 200, b'{"ok":true}'

        client = Client("https://api.example.com/", "secret", transport=transport)
        self.assertEqual({"ok": True}, client.health())
        self.assertEqual("GET", observed["method"])
        self.assertEqual("https://api.example.com/healthz", observed["url"])
        self.assertEqual("Bearer secret", observed["headers"]["authorization"])

    def test_structured_error(self) -> None:
        client = Client("https://api.example.com", transport=lambda *_: (503, b"offline"))
        with self.assertRaises(ClientError) as raised:
            client.health()
        self.assertEqual(503, raised.exception.status)


if __name__ == "__main__":
    unittest.main()
