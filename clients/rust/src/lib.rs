//! Transport-neutral request construction for Hacker House Medellín.

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Client {
    base_url: String,
    bearer_token: Option<String>,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RequestSpec {
    pub method: &'static str,
    pub url: String,
    pub authorization: Option<String>,
}

impl Client {
    pub fn new(base_url: impl Into<String>) -> Result<Self, &'static str> {
        let base_url = base_url.into().trim_end_matches('/').to_owned();
        if !(base_url.starts_with("https://") || base_url.starts_with("http://localhost")) {
            return Err("base URL must use HTTPS or localhost HTTP");
        }
        Ok(Self { base_url, bearer_token: None })
    }

    pub fn with_bearer_token(mut self, token: impl Into<String>) -> Self {
        self.bearer_token = Some(token.into());
        self
    }

    pub fn health(&self) -> RequestSpec { self.get("/healthz") }
    pub fn config(&self) -> RequestSpec { self.get("/api/config") }
    pub fn events(&self) -> RequestSpec { self.post("/api/events") }
    pub fn alerts(&self) -> RequestSpec { self.post("/api/alerts") }

    fn get(&self, path: &str) -> RequestSpec { self.request("GET", path) }
    fn post(&self, path: &str) -> RequestSpec { self.request("POST", path) }
    fn request(&self, method: &'static str, path: &str) -> RequestSpec {
        RequestSpec {
            method,
            url: format!("{}{}", self.base_url, path),
            authorization: self.bearer_token.as_ref().map(|token| format!("Bearer {token}")),
        }
    }
}

pub const PRODUCT: &str = "hacker-house-medellin";

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn constructs_authenticated_requests() {
        let client = Client::new("https://api.example.com/").unwrap().with_bearer_token("secret");
        assert_eq!(client.health().url, "https://api.example.com/healthz");
        assert_eq!(client.events().method, "POST");
        assert_eq!(client.config().authorization.as_deref(), Some("Bearer secret"));
    }

    #[test]
    fn rejects_cleartext_remote_urls() {
        assert!(Client::new("http://example.com").is_err());
        assert!(Client::new("http://localhost:8787").is_ok());
    }
}
