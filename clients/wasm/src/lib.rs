pub const PRODUCT: &str = "hacker-house-medellin";

#[no_mangle]
pub extern "C" fn client_abi_version() -> u32 { 1 }

pub fn normalize_base_url(value: &str) -> String { value.trim_end_matches('/').to_owned() }

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn normalizes_url() { assert_eq!(normalize_base_url("https://example.com/"), "https://example.com"); }
    #[test]
    fn exposes_abi_version() { assert_eq!(client_abi_version(), 1); }
}
