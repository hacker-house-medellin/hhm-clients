pub fn endpoint(base_url: String, path: String) -> String {
  base_url <> path
}

pub fn health(base_url: String) -> String { endpoint(base_url, "/healthz") }
pub fn config(base_url: String) -> String { endpoint(base_url, "/api/config") }
