const API_BASE = 'http://localhost:3001/api';

function getToken() {
  return localStorage.getItem('auth_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const { body, method = 'GET', isFormData = false } = options;

  const headers = { ...authHeaders() };
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const config = { method, headers };
  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Error en la petición');
  }

  return data;
}

export async function loginAPI(employee_number, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: { employee_number, password },
  });
  localStorage.setItem('auth_token', data.token);
  return data;
}

export function logoutAPI() {
  localStorage.removeItem('auth_token');
}

export async function getProfile() {
  return request('/auth/me');
}

export async function getClients() {
  return request('/clients');
}

export async function getClientBySlug(slug) {
  return request(`/clients/${slug}`);
}

export async function getRevisions() {
  return request('/revisions');
}

export async function getRevisionById(id) {
  return request(`/revisions/${id}`);
}

export async function createRevision(formData) {
  return request('/revisions', {
    method: 'POST',
    body: formData,
    isFormData: true,
  });
}

export async function getInspection(revisionId) {
  return request(`/inspections/revision/${revisionId}`);
}

export async function createInspection(revisionId, inspectionData) {
  return request(`/inspections/revision/${revisionId}`, {
    method: 'POST',
    body: inspectionData,
  });
}
