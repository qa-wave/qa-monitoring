# API Reference

All API endpoints are Next.js Route Handlers located in `src/app/api/`.

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
