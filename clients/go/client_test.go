package client

import "testing"

func TestNewNormalizesURL(t *testing.T) {
    client, err := New("https://api.example.com/")
    if err != nil { t.Fatal(err) }
    if client.BaseURL != "https://api.example.com" { t.Fatalf("unexpected URL: %s", client.BaseURL) }
}

func TestNewRejectsCleartextRemoteURL(t *testing.T) {
    if _, err := New("http://example.com"); err == nil { t.Fatal("expected validation error") }
}
