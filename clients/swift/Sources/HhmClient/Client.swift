import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

public struct ClientRequest: @unchecked Sendable {
    public let method: String
    public let url: URL
    public let headers: [String: String]
    public let body: Data?
}

public struct ClientResponse: Sendable {
    public let statusCode: Int
    public let body: Data
}

public typealias ClientTransport = @Sendable (ClientRequest) async throws -> ClientResponse

public enum ClientError: Error, Equatable {
    case invalidURL
    case http(status: Int, body: Data)
}

public struct Client: Sendable {
    public let baseURL: String
    public let token: String?
    private let transport: ClientTransport

    public init(baseURL: String, token: String? = nil, transport: ClientTransport? = nil) {
        self.baseURL = baseURL.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        self.token = token
        self.transport = transport ?? Client.defaultTransport
    }

    public func health() async throws -> Data { try await request(method: "GET", path: "/healthz") }
    public func getConfig() async throws -> Data { try await request(method: "GET", path: "/api/config") }
    public func emitEvent(_ payload: Any) async throws -> Data { try await request(method: "POST", path: "/api/events", payload: payload) }
    public func emitAlert(_ payload: Any) async throws -> Data { try await request(method: "POST", path: "/api/alerts", payload: payload) }

    public func request(method: String, path: String, payload: Any? = nil) async throws -> Data {
        guard let url = URL(string: baseURL + path) else { throw ClientError.invalidURL }
        var headers = ["accept": "application/json"]
        if let token, !token.isEmpty { headers["authorization"] = "Bearer " + token }
        var body: Data?
        if let payload {
            headers["content-type"] = "application/json"
            body = try JSONSerialization.data(withJSONObject: payload)
        }
        let response = try await transport(ClientRequest(method: method, url: url, headers: headers, body: body))
        guard (200..<300).contains(response.statusCode) else {
            throw ClientError.http(status: response.statusCode, body: response.body)
        }
        return response.body
    }

    private static let defaultTransport: ClientTransport = { request in
        var urlRequest = URLRequest(url: request.url)
        urlRequest.httpMethod = request.method
        request.headers.forEach { urlRequest.setValue($1, forHTTPHeaderField: $0) }
        urlRequest.httpBody = request.body
        let (data, response) = try await URLSession.shared.data(for: urlRequest)
        guard let http = response as? HTTPURLResponse else { throw ClientError.http(status: 0, body: data) }
        return ClientResponse(statusCode: http.statusCode, body: data)
    }
}
