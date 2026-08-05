package client

import (
    "bytes"
    "context"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "strings"
)

type Client struct {
    BaseURL string
    Token string
    HTTP *http.Client
}

func New(baseURL string) (*Client, error) {
    baseURL = strings.TrimRight(strings.TrimSpace(baseURL), "/")
    if !strings.HasPrefix(baseURL, "https://") && !strings.HasPrefix(baseURL, "http://localhost") {
        return nil, fmt.Errorf("base URL must use HTTPS or localhost HTTP")
    }
    return &Client{BaseURL: baseURL, HTTP: http.DefaultClient}, nil
}

func (c *Client) Health(ctx context.Context) (*http.Response, error) {
    return c.Do(ctx, http.MethodGet, "/healthz", nil)
}

func (c *Client) EmitEvent(ctx context.Context, payload any) (*http.Response, error) {
    return c.Do(ctx, http.MethodPost, "/api/events", payload)
}

func (c *Client) Do(ctx context.Context, method, path string, payload any) (*http.Response, error) {
    var body io.Reader
    if payload != nil {
        encoded, err := json.Marshal(payload)
        if err != nil { return nil, err }
        body = bytes.NewReader(encoded)
    }
    req, err := http.NewRequestWithContext(ctx, method, c.BaseURL+path, body)
    if err != nil { return nil, err }
    req.Header.Set("Accept", "application/json")
    if payload != nil { req.Header.Set("Content-Type", "application/json") }
    if c.Token != "" { req.Header.Set("Authorization", "Bearer "+c.Token) }
    return c.HTTP.Do(req)
}
