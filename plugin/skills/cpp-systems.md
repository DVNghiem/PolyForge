# C/C++ Systems

C/C++ systems development patterns for PolyForge agents.

## Modern C++ (C++17/20)

- Default to C++20; use `std::span`, `std::ranges`, concepts, and coroutines where applicable
- Prefer `std::string_view` over `const std::string&` for read-only string parameters
- `std::optional<T>` for nullable values; `std::expected<T, E>` (C++23) for error returns
- Structured bindings: `auto [key, val] = entry;` — prefer over `.first`/`.second`
- `[[nodiscard]]` on functions whose return values must not be ignored

## Memory Management

- Zero raw `new`/`delete` in modern code — use smart pointers exclusively
- `std::unique_ptr<T>` for sole ownership; `std::shared_ptr<T>` only when ownership is shared
- `std::make_unique` / `std::make_shared` — never call `new` directly
- RAII for all resources: file handles, sockets, locks must be wrapped in destructors
- Prefer stack allocation; heap-allocate only when lifetime or size is dynamic

## Concurrency (C++11+)

- `std::thread` + `std::jthread` (C++20, auto-joins) for threading
- `std::mutex` + `std::lock_guard` / `std::scoped_lock` for mutual exclusion
- `std::atomic<T>` for lock-free flag/counter patterns
- `std::condition_variable` for producer-consumer signaling
- Avoid data races: all shared mutable state must be synchronized

## Build Systems

- **CMake** (3.21+): use modern target-based approach — `target_link_libraries`, `target_include_directories`
- `find_package(PkgName REQUIRED)` for system dependencies; `FetchContent` for vendored libs
- Separate `CMakeLists.txt` per subdirectory; avoid global `include_directories`
- Enable warnings: `-Wall -Wextra -Wpedantic`; treat warnings as errors in CI: `-Werror`

## Error Handling

- Use exceptions for truly exceptional conditions; return codes or `std::expected` for recoverable errors
- Never throw from destructors — mark them `noexcept`
- RAII ensures cleanup even in exception paths — no `try/catch` needed around every resource
- Define custom exception classes inheriting from `std::runtime_error` or `std::logic_error`

## Testing

- **Google Test** (`gtest`): `TEST(Suite, Case)` for unit tests; `TEST_F` for fixture-based tests
- **Catch2**: header-only alternative with BDD-style `GIVEN/WHEN/THEN` support
- **AddressSanitizer** (`-fsanitize=address`): run in CI to catch memory errors
- **Valgrind**: heap profiling and leak detection for release builds
- Link against sanitizers during test builds, not production builds

## Anti-Patterns

- Raw pointers for ownership (use smart pointers)
- `using namespace std;` in header files — pollutes including files' namespaces
- `reinterpret_cast` without alignment/aliasing justification
- `printf` / `scanf` in C++ — use `<iostream>` or `std::format` (C++20)
- Ignoring compiler warnings — treat them as errors
- `malloc`/`free` in C++ code — use `new`/`delete` or preferably smart pointers
