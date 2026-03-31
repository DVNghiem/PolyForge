# Java Backend

Java backend development patterns for PolyForge agents.

## Spring Boot

- Annotate entry point with `@SpringBootApplication`; rely on component scan, not manual wiring
- `@RestController` + `@RequestMapping` for HTTP endpoints; `@RequestBody` for JSON deserialization
- `@Service` for business logic, `@Repository` for data access — respect the layered boundary
- Use constructor injection (`@RequiredArgsConstructor` from Lombok), not field injection
- `application.yml` over `application.properties` for structured configuration; bind with `@ConfigurationProperties`

## Async and Concurrency

- `@Async` + `CompletableFuture<T>` for non-blocking method execution
- `ExecutorService` / `ForkJoinPool` for CPU-bound parallelism
- `@Scheduled` for periodic tasks; prefer Spring's task scheduler over raw `Timer`
- Virtual threads (Java 21+): enable with `spring.threads.virtual.enabled=true` for high-concurrency I/O

## Data Access (JPA / Spring Data)

- Extend `JpaRepository<Entity, ID>` for standard CRUD; add custom queries with `@Query`
- Use `@Transactional` at the service layer, not the repository layer
- Fetch strategies: default to `LAZY`; use `JOIN FETCH` in queries to avoid N+1
- DTOs for API responses — never expose JPA entities directly to controllers
- Flyway or Liquibase for schema migrations; never rely on `ddl-auto=update` in production

## Error Handling

- `@ControllerAdvice` + `@ExceptionHandler` for centralized HTTP error mapping
- Define a `ProblemDetail` (RFC 9457) or standard error response DTO
- Use custom exceptions (`ResourceNotFoundException extends RuntimeException`) for domain errors
- Always log the stack trace at error boundaries; suppress it in user-facing messages

## Testing

- JUnit 5 (`@Test`, `@ParameterizedTest`) as the test framework
- `@SpringBootTest` for integration tests; `@WebMvcTest` for controller-only slices
- MockMvc for HTTP layer testing; `@MockBean` for service layer mocking
- Testcontainers for real database integration tests; avoid in-memory H2 for PostgreSQL projects
- AssertJ for fluent assertions: `assertThat(result).isEqualTo(expected)`

## Build and Packaging

- Maven (`pom.xml`) or Gradle (`build.gradle.kts`) — prefer Kotlin DSL for Gradle
- `spring-boot-maven-plugin` / `bootJar` produces an executable fat JAR
- Multi-stage Docker build: compile in JDK image, run in JRE image
- GraalVM native image for startup-critical services (requires reflection config)

## Anti-Patterns

- Field injection (`@Autowired` on fields) — use constructor injection
- Business logic in controllers — push to service layer
- Checked exceptions crossing layer boundaries — wrap in unchecked domain exceptions
- `Optional.get()` without `isPresent()` — use `orElseThrow()`
- Mutable shared state in `@Component` beans — beans are singletons by default
