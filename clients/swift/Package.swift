// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "HhmClient",
    platforms: [.iOS(.v15), .macOS(.v12)],
    products: [.library(name: "HhmClient", targets: ["HhmClient"])],
    targets: [.target(name: "HhmClient")]
)
