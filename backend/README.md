# Job Queue API

NestJS backend for the Mini Job Queue Dashboard assignment.

## Stack

- NestJS
- JavaScript
- SQLite-compatible Turso/libSQL
- REST API

## Environment variables

Create a `.env` file locally:

```env
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
PORT=3001
```

Never commit the real `.env` file or token.

## Run locally

```bash
npm install
npm run start:dev
```

API:

```text
http://localhost:3001/jobs
```

## API

- `GET /jobs` - list jobs
- `POST /jobs` - create a job
- `PATCH /jobs/:id/status` - change job status
- `DELETE /jobs/:id` - delete a job

Create job body:

```json
{
  "title": "Send Welcome Email",
  "type": "email"
}
```

Status body:

```json
{
  "status": "running"
}
```

## Allowed transitions

```text
pending -> running -> completed
pending -> failed
```

Completed and failed jobs cannot transition again.

The status condition is included in the database `UPDATE`, so two requests attempting the same transition cannot both succeed.
