const statuses = ['pending', 'running', 'completed', 'failed'];

export default function StatusSummary({ jobs }) {
  return (
    <section className="summary-grid" aria-label="Job status counts">
      {statuses.map((status) => (
        <div className="summary-card" key={status}>
          <span className={`status-dot ${status}`} />
          <div>
            <p>{status}</p>
            <strong>{jobs.filter((job) => job.status === status).length}</strong>
          </div>
        </div>
      ))}
    </section>
  );
}
