import XCTest
@testable import HhmClient

final class ClientTests: XCTestCase {
    func testHealthContract() async throws {
        actor Observation {
            var request: ClientRequest?
            func set(_ value: ClientRequest) { request = value }
            func get() -> ClientRequest? { request }
        }
        let observation = Observation()
        let client = Client(baseURL: "https://api.example.com/", token: "secret") { request in
            await observation.set(request)
            return ClientResponse(statusCode: 200, body: Data("{\"ok\":true}".utf8))
        }
        let body = try await client.health()
        XCTAssertEqual(String(decoding: body, as: UTF8.self), "{\"ok\":true}")
        let request = await observation.get()
        XCTAssertEqual(request?.method, "GET")
        XCTAssertEqual(request?.url.absoluteString, "https://api.example.com/healthz")
        XCTAssertEqual(request?.headers["authorization"], "Bearer secret")
    }
}
