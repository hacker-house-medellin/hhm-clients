#pragma once

#include <stdexcept>
#include <string>
#include <utility>

namespace hhm {
class Client {
 public:
  explicit Client(std::string base_url, std::string token = {})
      : base_url_(std::move(base_url)), token_(std::move(token)) {
    if (base_url_.empty()) throw std::invalid_argument("base_url must not be empty");
  }

  [[nodiscard]] std::string endpoint(std::string path) const {
    while (!path.empty() && path.front() == '/') path.erase(path.begin());
    return base_url_ + (base_url_.back() == '/' ? "" : "/") + path;
  }

  [[nodiscard]] const std::string& token() const { return token_; }

 private:
  std::string base_url_;
  std::string token_;
};
}  // namespace hhm
