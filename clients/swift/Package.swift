// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "HhmClient",
    platforms: [.macOS(.v12), .iOS(.v15)],
    products: [.library(name: "HhmClient", targets: ["HhmClient"])],
    targets: [
        .target(name: "HhmClient"),
        .testTarget(name: "HhmClientTests", dependencies: ["HhmClient"])
    ]
)
