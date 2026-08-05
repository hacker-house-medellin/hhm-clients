class HhmClient {
  HhmClient(String baseUrl, {this.bearerToken})
      : baseUrl = Uri.parse(baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl);

  final Uri baseUrl;
  final String? bearerToken;

  Uri endpoint(String path) => baseUrl.resolve(path.startsWith('/') ? path.substring(1) : path);
  Uri get health => endpoint('/healthz');
  Uri get config => endpoint('/api/config');
}
