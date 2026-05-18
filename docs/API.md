# API Reference

All API endpoints are Next.js Route Handlers located in `src/app/api/`.

## Pagination

All list endpoints (`GET /api/users`, `GET /api/applications`, `GET /api/environments`, `GET /api/alerts`, `GET /api/audit`, `GET /api/integrations`) support pagination via query parameters:

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | number | all items | Maximum number of items to return |
| `offset` | number | 0 | Number of items to skip |

**Response header:** `X-Total-Count` -- total number of items (before pagination).

**Example:**
```
GET /api/applications?limit=10&offset=20
→ 200 OK
→ X-Total-Count: 42
→ { "items": [...] }
```

## Error Response Format

All error responses follow a consistent format:

```json
{
  "error": "Human-readable error message.",
  "issues": { ... },
  "code": "OPTIONAL_ERROR_CODE"
}
```

| Field | Type | Presence | Description |
|---|---|---|---|
| `error` | string | Always | Error message |
| `issues` | object | Validation errors only | Zod flatten output with `fieldErrors` and `formErrors` |
| `code` | string | Store errors only | Machine-readable error code (e.g. `DUPLICATE_SLUG`) |

Common HTTP status codes:
- **400** -- Invalid request data (with `issues` for validation errors)
- **401** -- Not authenticated
- **403** -- Insufficient permissions (wrong role)
- **404** -- Resource not found
- **409** -- Conflict (duplicate slug, email already exists)
- **500** -- Internal server error

## Authentication

### POST /api/auth/login

Authenticate a user and set a session cookie.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "demo"
}
```

**Response (200):**
```json
{
  "ok": true,
  "role": "admin"
}
```

**Errors:**
- 400 -- Invalid request format
- 401 -- User not found or wrong password
- 500 -- Internal error

---

### POST /api/auth/logout

Clear the session cookie.

**Request:** No body required.

**Response (200):**
```json
{
  "ok": true
}
```

---

## Branding

### GET /api/branding

Get current brand settings. Requires authentication.

**Response (200):**
```json
{
  "productName": "Zornik",
  "tenantName": "CEPS",
  "primary": "#2162AD",
  "secondary": "#4F91CE",
  "tertiary": "#6BC7F1",
  "style": "vercel"
}
```

**Errors:**
- 401 -- Not authenticated

---

### PUT /api/branding

Update brand settings. Requires admin or operator role.

**Request:**
```json
{
  "productName": "Zornik",
  "tenantName": "CEPS",
  "primary": "#2162AD",
  "secondary": "#4F91CE",
  "tertiary": "#6BC7F1",
  "style": "linear"
}
```

**Response (200):** Returns the saved settings object.

**Errors:**
- 400 -- Invalid data (with `issues` field)
- 401 -- Not authenticated
- 403 -- Insufficient permissions
- 500 -- Save failed

---

## Users

### GET /api/users

List all users (public fields only). Requires admin role.

**Response (200):**
```json
{
  "items": [
    {
      "id": "u1",
      "email": "admin@example.com",
      "name": "Admin",
      "role": "admin",
      "personaPreference": "all"
    }
  ]
}
```

**Errors:**
- 401 -- Not authenticated
- 403 -- Not admin

---

### POST /api/users

Create a new user. Requires admin role.

**Request:**
```json
{
  "email": "user@example.com",
  "name": "New User",
  "role": "viewer",
  "personaPreference": "dev",
  "password": "secret123"
}
```

**Response (201):**
```json
{
  "id": "generated-uuid"
}
```

**Errors:**
- 400 -- Invalid data or password too short (min 6 chars)
- 401 -- Not authenticated
- 403 -- Not admin
- 409 -- Email already exists

---

### GET /api/users/[id]

Get a single user. Requires admin role.

**Response (200):** Public user object (same shape as list item).

**Errors:**
- 401 -- Not authenticated
- 403 -- Not admin
- 404 -- User not found

---

### PATCH /api/users/[id]

Update a user. Requires admin role. All fields optional.

**Request:**
```json
{
  "name": "Updated Name",
  "role": "admin",
  "personaPreference": "po",
  "password": "newpassword"
}
```

**Response (200):** Updated public user object.

**Errors:**
- 400 -- Invalid data
- 401 -- Not authenticated
- 403 -- Not admin
- 404 -- User not found

---

### DELETE /api/users/[id]

Delete a user. Requires admin role. Cannot delete yourself.

**Response (200):**
```json
{
  "ok": true
}
```

**Errors:**
- 401 -- Not authenticated
- 403 -- Not admin
- 404 -- User not found

---

## Integrations

### GET /api/integrations

List all integration instances. Credentials are redacted.

**Response (200):**
```json
{
  "items": [
    {
      "id": "int-1",
      "providerKey": "github",
      "displayName": "GitHub - main org",
      "enabled": true,
      "credentials": { "_redacted": true },
      "scope": {},
      "lastTestedAt": "2026-04-17T10:00:00Z",
      "lastTestResult": "ok"
    }
  ]
}
```

---

### POST /api/integrations

Create a new integration instance. Requires admin role.

**Request:**
```json
{
  "providerKey": "github",
  "displayName": "GitHub - main org",
  "credentials": {
    "token": "ghp_xxx"
  },
  "scope": {
    "appIds": ["app-1"],
    "envIds": ["env-prod"]
  },
  "enabled": true
}
```

Credentials are validated against the provider's Zod schema.

**Response (201):** Created integration object.

**Errors:**
- 400 -- Invalid data, unknown provider, or credentials don't match schema
- 401 -- Not authenticated
- 403 -- Not admin

---

### GET /api/integrations/[id]

Get a single integration (credentials redacted).

**Response (200):** Integration object with `credentials: { "_redacted": true }`.

---

### PATCH /api/integrations/[id]

Update an integration. Requires admin role.

**Request:**
```json
{
  "displayName": "Updated name",
  "enabled": false,
  "credentials": { "token": "ghp_new" }
}
```

**Response (200):**
```json
{
  "ok": true
}
```

**Errors:**
- 400 -- Invalid data
- 403 -- Not admin
- 404 -- Integration not found

---

### DELETE /api/integrations/[id]

Delete an integration. Requires admin role.

**Response (200):**
```json
{
  "ok": true
}
```

---

### POST /api/integrations/[id]/test

Test an integration's connection. Creates an adapter instance from stored credentials and calls `testConnection()`. Updates `lastTestedAt` and `lastTestResult` on the integration record.

**Response (200):**
```json
{
  "ok": true,
  "message": "Connected to GitHub API. 42 repos accessible.",
  "latencyMs": 234
}
```

Or on failure (still 200):
```json
{
  "ok": false,
  "message": "Authentication failed: Bad credentials"
}
```

---

### POST /api/integrations/[id]/sync

Synchronize one integration into the persistent ingest store. Requires admin role.

**Response (200):**
```json
{
  "ok": true,
  "run": {
    "id": "ingest-a1b2c3d4",
    "integrationId": "int-a1b2c3d4",
    "providerKey": "github",
    "status": "success",
    "counts": {
      "deployments": 10,
      "pipelineRuns": 20
    }
  }
}
```

---

### POST /api/integrations/sync

Synchronize all enabled integrations into the persistent ingest store. Requires admin role.

**Response (200):**
```json
{
  "ok": true,
  "runs": []
}
```

---

## Applications

### GET /api/applications

List all applications. Requires authentication. Supports pagination.

**Response (200):**
```json
{
  "items": [
    {
      "id": "app-1",
      "name": "Web App",
      "slug": "web-app",
      "language": "TypeScript",
      "description": "Main web application",
      "repoUrl": "https://github.com/org/web-app",
      "owners": ["admin@example.com"],
      "environmentIds": ["env-prod", "env-staging"],
      "tags": ["frontend", "critical"]
    }
  ]
}
```

**Headers:** `X-Total-Count: 5`

---

### POST /api/applications

Create a new application. Requires admin role.

**Request:**
```json
{
  "name": "New App",
  "slug": "new-app",
  "language": "Go",
  "description": "Backend microservice",
  "repoUrl": "https://github.com/org/new-app",
  "owners": [],
  "environmentIds": [],
  "tags": ["backend"]
}
```

**Response (201):**
```json
{
  "id": "generated-uuid",
  "item": { ... }
}
```

**Errors:**
- 400 -- Invalid data (with `issues`)
- 401 -- Not authenticated
- 403 -- Not admin
- 409 -- Duplicate slug (with `code`)

---

### GET /api/applications/[id]

Get a single application. Requires authentication.

**Response (200):** Application object.

**Errors:**
- 401 -- Not authenticated
- 404 -- Application not found

---

### PATCH /api/applications/[id]

Update an application. Requires admin role. All fields optional. Uses strict schema (unknown fields rejected).

**Response (200):** Updated application object.

**Errors:**
- 400 -- Invalid data
- 401 -- Not authenticated
- 403 -- Not admin
- 404 -- Application not found
- 409 -- Duplicate slug

---

### DELETE /api/applications/[id]

Delete an application. Requires admin role.

**Response (200):**
```json
{
  "ok": true
}
```

**Errors:**
- 401 -- Not authenticated
- 403 -- Not admin
- 404 -- Application not found

---

## Environments

### GET /api/environments

List all environments. Requires authentication. Supports pagination.

**Response (200):**
```json
{
  "items": [
    {
      "id": "env-prod",
      "name": "Production",
      "slug": "production",
      "url": "https://app.example.com",
      "region": "eu-west-1",
      "color": "#22c55e",
      "isProduction": true,
      "order": 0
    }
  ]
}
```

**Headers:** `X-Total-Count: 3`

---

### POST /api/environments

Create a new environment. Requires admin role.

**Request:**
```json
{
  "name": "Staging",
  "slug": "staging",
  "url": "https://staging.example.com",
  "region": "eu-west-1",
  "color": "#64748b",
  "isProduction": false,
  "order": 1
}
```

**Response (201):**
```json
{
  "id": "generated-uuid",
  "item": { ... }
}
```

**Errors:**
- 400 -- Invalid data (with `issues`)
- 401 -- Not authenticated
- 403 -- Not admin
- 409 -- Duplicate slug (with `code`)

---

### GET /api/environments/[id]

Get a single environment. Requires authentication.

**Response (200):** Environment object.

**Errors:**
- 401 -- Not authenticated
- 404 -- Environment not found

---

### PATCH /api/environments/[id]

Update an environment. Requires admin role. All fields optional. Uses strict schema.

**Response (200):** Updated environment object.

**Errors:**
- 400 -- Invalid data
- 401 -- Not authenticated
- 403 -- Not admin
- 404 -- Environment not found
- 409 -- Duplicate slug

---

### DELETE /api/environments/[id]

Delete an environment. Requires admin role.

**Response (200):**
```json
{
  "ok": true
}
```

**Errors:**
- 401 -- Not authenticated
- 403 -- Not admin
- 404 -- Environment not found

---

## Alerts

### GET /api/alerts

List all alert rules. Requires admin role. Supports pagination.

**Response (200):**
```json
{
  "items": [
    {
      "id": "alert-1",
      "name": "High latency",
      "metric": "latency",
      "operator": "gt",
      "threshold": 500,
      "channel": "slack",
      "enabled": true,
      "createdBy": "admin@example.com"
    }
  ]
}
```

**Headers:** `X-Total-Count: 4`

**Errors:**
- 401 -- Not authenticated
- 403 -- Not admin

---

### POST /api/alerts

Create a new alert rule. Requires admin role. Creates an audit log entry.

**Request:**
```json
{
  "name": "High error rate",
  "metric": "errorRate",
  "operator": "gt",
  "threshold": 5,
  "channel": "both",
  "enabled": true
}
```

Allowed `metric` values: `latency`, `errorRate`, `uptime`, `deployFailRate`, `flakyTests`.
Allowed `operator` values: `gt`, `lt`, `eq`.
Allowed `channel` values: `email`, `slack`, `both`.

**Response (201):**
```json
{
  "id": "generated-uuid"
}
```

**Errors:**
- 400 -- Invalid data (with `issues`)
- 401 -- Not authenticated
- 403 -- Not admin

---

### PATCH /api/alerts/[id]

Update an alert rule. Requires admin role. All fields optional. Creates an audit log entry.

**Response (200):** Updated alert rule object.

**Errors:**
- 400 -- Invalid data
- 401 -- Not authenticated
- 403 -- Not admin
- 404 -- Rule not found

---

### DELETE /api/alerts/[id]

Delete an alert rule. Requires admin role. Creates an audit log entry.

**Response (200):**
```json
{
  "ok": true
}
```

**Errors:**
- 401 -- Not authenticated
- 403 -- Not admin
- 404 -- Rule not found

---

## Audit

### GET /api/audit

List audit log entries (most recent first). Requires admin role. Supports pagination.

**Query params:**
- `limit` -- max entries to fetch from store (default 50, max 200)
- `offset` -- skip N entries from the result

**Response (200):**
```json
{
  "items": [
    {
      "id": "audit-1",
      "actor": "admin@example.com",
      "action": "alert.create",
      "target": "High latency",
      "details": "Metric: latency, gt 500",
      "timestamp": "2026-05-09T10:00:00Z"
    }
  ]
}
```

**Headers:** `X-Total-Count: 120`

**Errors:**
- 401 -- Not authenticated
- 403 -- Not admin

---

## Status

### GET /api/status/public

Public status page data. Revalidates every 30 seconds (ISR).

**Response (200):**
```json
{
  "status": "ok",
  "services": [
    {
      "name": "Web App",
      "status": "ok",
      "uptimePct30d": 99.97
    }
  ],
  "activeIncidents": [
    {
      "id": "inc-1",
      "title": "Elevated error rates",
      "severity": "sev2",
      "startedAt": "2026-04-17T08:00:00Z",
      "status": "monitoring"
    }
  ],
  "maintenance": [
    {
      "id": "maint-1",
      "title": "Database migration",
      "startsAt": "2026-04-20T02:00:00Z",
      "endsAt": "2026-04-20T04:00:00Z"
    }
  ]
}
```

---

### POST /api/status/subscribe

Subscribe an email to status updates (MVP: logs only).

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "ok": true,
  "message": "Odber nastaven."
}
```

---

## Health

### GET /api/health

Simple health check endpoint.

**Response (200):**
```json
{
  "status": "ok",
  "services": 12
}
```

---

### GET /api/stream/health

Server-Sent Events (SSE) stream of health data. Sends a `health` event every 30 seconds.

**Event format:**
```
event: health
data: {"ok":10,"warn":1,"down":1,"total":12,"at":"2026-04-17T12:00:00Z"}
```

**Headers:**
- Content-Type: text/event-stream
- Cache-Control: no-cache
- Connection: keep-alive

---

### GET /api/cron/health-check

Vercel Cron endpoint for periodic health checks. Protected by `CRON_SECRET`.

**Auth:** Bearer token in Authorization header matching `CRON_SECRET` env var.

**Response (200):**
```json
{
  "ok": 10,
  "warn": 1,
  "down": 1,
  "total": 12,
  "checkedAt": "2026-04-17T12:00:00Z"
}
```

---

### GET /api/cron/ingest

Vercel Cron endpoint for synchronizing all enabled integrations into the persistent ingest store. Protected by `CRON_SECRET`.

**Auth:** Bearer token in Authorization header matching `CRON_SECRET` env var.

**Response (200):**
```json
{
  "ok": true,
  "runs": [
    {
      "id": "ingest-a1b2c3d4",
      "integrationId": "int-a1b2c3d4",
      "providerKey": "github",
      "status": "success",
      "counts": {
        "deployments": 10,
        "pipelineRuns": 20
      }
    }
  ]
}
```

---

## Database

### GET /api/db/migrate

Run database migrations (Postgres/Neon). Protected by `CRON_SECRET`.

**Auth:** Bearer token in Authorization header.

**Response (200):**
```json
{
  "ok": true,
  "message": "Migration complete"
}
```

**Errors:**
- 401 -- Invalid or missing secret
- 503 -- DATABASE_URL not configured
- 500 -- Migration failed

---

## Webhooks

### POST /api/webhooks/github

Receive GitHub webhook events. Validates signature using `GITHUB_WEBHOOK_SECRET` with HMAC-SHA256 (timing-safe comparison).

**Headers:**
- `x-github-event` -- Event type (push, pull_request, etc.)
- `x-hub-signature-256` -- HMAC signature

**Response (200):**
```json
{
  "ok": true,
  "event": "push"
}
```

---

### POST /api/webhooks/sentry

Receive Sentry webhook events. Validates signature using `SENTRY_WEBHOOK_SECRET` with HMAC-SHA256.

**Headers:**
- `sentry-hook-resource` -- Resource type
- `sentry-hook-signature` -- HMAC signature

**Response (200):**
```json
{
  "ok": true,
  "resource": "event_alert"
}
```
