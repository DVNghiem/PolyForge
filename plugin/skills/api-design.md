# API Design

Backend API design patterns and conventions.

## REST

- **URL design**: Nouns for resources (`/users`, `/orders`), not verbs (`/getUser`)
- **HTTP verbs**: GET (read), POST (create), PUT (full replace), PATCH (partial update), DELETE
- **Status codes**: 200 (OK), 201 (Created), 204 (No Content), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 409 (Conflict), 422 (Validation Error), 500 (Server Error)
- **Versioning**: URL path (`/v1/users`) for breaking changes; avoid header-based versioning for simplicity

## Error Contract

Standardized error response shape:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": [
      { "field": "email", "issue": "invalid format" }
    ]
  }
}
```

Rules:
- Never expose stack traces to clients
- Use stable error codes (not HTTP status text)
- Include enough detail to fix the request
- Log full error details server-side

## gRPC / Protobuf

- Service definitions: one file per service domain
- Message design: use wrapper types (`google.protobuf.StringValue`) for optional fields
- Streaming: server-streaming for real-time updates, bidirectional for chat-like flows
- Error handling: use `google.rpc.Status` with appropriate codes

## Pagination

- **Cursor-based** (preferred): `?cursor=<opaque>&limit=20` — stable under concurrent writes
- **Offset-based** (simple): `?page=1&size=20` — avoid for large/dynamic datasets
- Always return `next_cursor` or `has_more` in response

## WebSocket

- Clear handshake protocol (auth token in query or first message)
- Typed message frames: `{ "type": "event_name", "payload": { ... } }`
- Heartbeat/ping-pong for connection health
- Reconnection strategy with exponential backoff
