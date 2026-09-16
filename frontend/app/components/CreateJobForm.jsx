import { useState } from 'react';

export default function CreateJobForm({ onCreate, disabled }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!title.trim() || !type.trim()) {
      setError('Title and type are required.');
      return;
    }

    try {
      await onCreate({ title: title.trim(), type: type.trim() });
      setTitle('');
      setType('');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="title">Job title</label>
        <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Generate monthly report" maxLength={120} />
      </div>
      <div className="field">
        <label htmlFor="type">Type</label>
        <input id="type" value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g. report" maxLength={60} />
      </div>
      <button className="primary-button" type="submit" disabled={disabled}>Create job</button>
      {error && <p className="form-error">{error}</p>}
    </form>
  );
}
