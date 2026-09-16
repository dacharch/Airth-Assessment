const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://airth-assessment.onrender.com';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || 'Something went wrong.');
  }
  return data;
}

export const jobsApi = {
  list: () => request('/jobs'),
  create: (job) => request('/jobs', { method: 'POST', body: JSON.stringify(job) }),
  updateStatus: (id, status) => request(`/jobs/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  remove: (id) => request(`/jobs/${id}`, { method: 'DELETE' }),
};
