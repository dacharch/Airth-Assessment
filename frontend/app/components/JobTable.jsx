const nextActions = {
  pending: ['running', 'failed'],
  running: ['completed'],
  completed: [],
  failed: [],
};

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function JobTable({ jobs, onStatusChange, onDelete, busyId }) {
  if (!jobs.length) {
    return <div className="empty-state">No jobs match the selected filter.</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Job</th>
            <th>Type</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>
                <strong>{job.title}</strong>
                <small>#{job.id}</small>
              </td>
              <td>{job.type}</td>
              <td><span className={`badge ${job.status}`}>{job.status}</span></td>
              <td>{formatDate(job.createdAt)}</td>
              <td>
                <div className="actions">
                  {nextActions[job.status].map((status) => (
                    <button key={status} className="action-button" disabled={busyId === job.id} onClick={() => onStatusChange(job.id, status)}>
                      {status}
                    </button>
                  ))}
                  <button className="delete-button" disabled={busyId === job.id} onClick={() => onDelete(job.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
