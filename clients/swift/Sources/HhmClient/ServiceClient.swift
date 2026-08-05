import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

public struct ApiError: Error { public let status: Int; public let body: Any? }

public final class ServiceClient {
    private let baseURL: URL
    private let token: String?
    private let session: URLSession

    public init(baseURL: URL, token: String? = nil, session: URLSession = .shared) {
        self.baseURL = baseURL; self.token = token; self.session = session
    }
    public func health() async throws -> Any? { try await request(path: "/healthz") }
    public func ready() async throws -> Any? { try await request(path: "/readyz") }
    public func config() async throws -> Any? { try await request(path: "/api/config") }
    public func emitEvent(_ payload: Any) async throws -> Any? { try await request(path: "/api/events", method: "POST", body: payload) }
    public func createLead(_ payload: Any) async throws -> Any? { try await request(path: "/api/leads", method: "POST", body: payload) }
    public func createAlert(_ payload: Any) async throws -> Any? { try await request(path: "/api/alerts", method: "POST", body: payload) }
    public func request(path: String, method: String = "GET", body: Any? = nil) async throws -> Any? {
        let relative = path.hasPrefix("/") ? String(path.dropFirst()) : path
        var request = URLRequest(url: baseURL.appendingPathComponent(relative))
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "accept")
        if let token { request.setValue("Bearer \(token)", forHTTPHeaderField: "authorization") }
        if let body { request.setValue("application/json", forHTTPHeaderField: "content-type"); request.httpBody = try JSONSerialization.data(withJSONObject: body) }
        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw URLError(.badServerResponse) }
        let parsed = data.isEmpty ? nil : try JSONSerialization.jsonObject(with: data)
        guard (200..<300).contains(http.statusCode) else { throw ApiError(status: http.statusCode, body: parsed) }
        return parsed
    }
}
