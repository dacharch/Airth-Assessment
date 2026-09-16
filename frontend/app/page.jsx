'use client';

import { useEffect, useMemo, useState } from 'react';
import CreateJobForm from './components/CreateJobForm';
import JobTable from './components/JobTable';
import StatusSummary from './components/StatusSummary';
import { jobsApi } from '../lib/api';

const filters = ['all', 'pending', 'running', 'completed', 'failed'];

export default function HomePage() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  async function loadJobs() {
    setError('');
    setLoading(true);
    try {
      setJobs(await jobsApi.list());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  async function createJob(job) {
    setError('');
    const created = await jobsApi.create(job);
    setJobs((current) => [created, ...current]);
  }

  async function changeStatus(id, status) {
    setError('');
    setBusyId(id);
    try {
      const updated = await jobsApi.updateStatus(id, status);
      setJobs((current) => current.map((job) => job.id === id ? updated : job));
    } catch (err) {
      setError(err.message);
      await loadJobs();
    } finally {
      setBusyId(null);
    }
  }

  async function deleteJob(id) {
    if (!window.confirm('Delete this job?')) return;
    setError('');
    setBusyId(id);
    try {
      await jobsApi.remove(id);
      setJobs((current) => current.filter((job) => job.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const filteredJobs = useMemo(
    () => filter === 'all' ? jobs : jobs.filter((job) => job.status === filter),
    [jobs, filter],
  );

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Operations</p>
          <h1>Job Queue Dashboard</h1>
          <p className="subtitle">Create, monitor and manage background jobs.</p>
        </div>
        <button className="secondary-button" onClick={loadJobs} disabled={loading}>Refresh</button>
      </header>

      <StatusSummary jobs={jobs} />

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Create a job</h2>
            <p>New jobs start in the pending state.</p>
          </div>
        </div>
        <CreateJobForm onCreate={createJob} disabled={loading} />
      </section>

      <section className="panel">
        <div className="panel-header jobs-header">
          <div>
            <h2>Jobs</h2>
            <p>{filteredJobs.length} job{filteredJobs.length === 1 ? '' : 's'} shown</p>
          </div>
          <div className="filters" aria-label="Filter jobs by status">
            {filters.map((item) => (
              <button key={item} className={filter === item ? 'filter active' : 'filter'} onClick={() => setFilter(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="api-error" role="alert">{error}</div>}
        {loading ? <div className="loading">Loading jobs…</div> : <JobTable jobs={filteredJobs} onStatusChange={changeStatus} onDelete={deleteJob} busyId={busyId} />}
      </section>
    </main>
  );
}
