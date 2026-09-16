# Mini Job Queue Dashboard

A small Job Queue Management Dashboard built to follow the provided React + NestJS internship assignment.

## Stack

- Frontend: Next.js + React, JavaScript only (`.js` / `.jsx`)
- Backend: NestJS, JavaScript only (`.js`)
- Database: SQLite using `better-sqlite3`
- API: REST

## Requirements implemented

- `POST /jobs` — create a job
- `GET /jobs` — get all jobs
- `PATCH /jobs/:id/status` — update job status
- `DELETE /jobs/:id` — delete a job
- Job fields: `id`, `title`, `type`, `status`, `createdAt`
- Allowed statuses: `pending`, `running`, `completed`, `failed`
- Status filtering
- Counts for each status
- Create, change status and delete actions
- Loading and API error states
- Backend validation and error handling
- SQLite persistence
- Backend-enforced status transitions and concurrency protection

## Required status transitions

The implementation follows the assignment exactly:

```text
pending -> running -> completed
pending -> failed
```

`completed` and `failed` are terminal states.

## Concurrency decision

The status rule is enforced by the backend, not only by the frontend. The database update includes the job's expected current status:

```sql
UPDATE jobs
SET status = ?
WHERE id = ? AND status = ?;
```

If two browser tabs both see a job as `pending` and both request `pending -> running`, only one request can update the row. The other receives a conflict response. This also protects the rule when somebody calls the API directly instead of using React.

This is intentionally simple and avoids introducing a distributed locking system for a small assignment.

## Project structure

```text
job-queue-dashboard/
├── backend/
│   ├── src/
│   │   ├── jobs/
│   │   │   ├── jobs.controller.js
│   │   │   ├── jobs.module.js
│   │   │   ├── jobs.repository.js
│   │   │   └── jobs.service.js
│   │   ├── app.module.js
│   │   └── main.js
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   │   ├── CreateJobForm.jsx
│   │   │   ├── JobTable.jsx
│   │   │   └── StatusSummary.jsx
│   │   ├── globals.css
│   │   ├── layout.jsx
│   │   └── page.jsx
│   ├── lib/api.js
│   └── package.json
└── README.md
```

## Run locally

### Backend

```bash
cd backend
npm install
npm run start:dev
```

API: `http://localhost:3001`

### Frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Then:

```bash
cd frontend
npm install
npm run dev
```

Dashboard: `http://localhost:3000`

## API examples

### Create a job

```http
POST /jobs
Content-Type: application/json

{
  "title": "Generate monthly report",
  "type": "report"
}
```

### Change status

```http
PATCH /jobs/1/status
Content-Type: application/json

{
  "status": "running"
}
```

## Assumptions and trade-offs

- SQLite is used because the assignment explicitly permits PostgreSQL or SQLite.
- Authentication is outside the assignment scope.
- Jobs are manually transitioned from the dashboard; a background worker is not required by the assignment.
- Business rules live on the API so direct requests cannot bypass the allowed transitions.

## Bonus improvement

SQLite WAL mode is enabled to improve read/write behavior for the small multi-tab concurrency scenario.

With more time, I would add automated tests for status transitions and concurrency, structured logging, authentication, pagination, and a real worker queue such as BullMQ/Redis.

## JavaScript-only decision

The assignment requires React.js and NestJS but does not require TypeScript. This implementation deliberately uses JavaScript throughout so the frontend and backend contain no `.ts` or `.tsx` source files.
