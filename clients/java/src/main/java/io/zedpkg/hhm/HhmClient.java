package io.zedpkg.hhm;
import java.net.URI;
public record HhmClient(URI baseUri, String bearerToken) {}
