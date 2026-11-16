const API_BASE = process.env.REACT_APP_API_URL || '/api';

export async function getBlueprintBlob(filePath) {
  const base = API_BASE.replace(/\/api\/?$/, '');
  const response = await fetch(`${base}/uploads/${filePath}`, { headers: authHeaders() });
  if (response.status === 401) notifySessionInvalid();
  if (!response.ok) throw new Error('No se pudo cargar el plano');
  return response.blob();
}

const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized';

export function notifySessionInvalid() {
  localStorage.removeItem('auth_token');
  window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
}

/** Evita "Unexpected token '<'" cuando el servidor devuelve HTML (404 Express, proxy, etc.) */
async function parseJsonResponse(res) {
  const text = await res.text();
  if (!text) return {};
  const trimmed = text.trim();
  if (trimmed.startsWith('<') || trimmed.startsWith('<!')) {
    throw new Error(
      'El servidor respondió con una página web en lugar de datos (JSON). ' +
        'Reinicia el backend con `npm run start:server` o `npm run dev` y asegúrate de que use el código actual (ruta GET /api/access-help).'
    );
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Respuesta del servidor no válida. Comprueba que la API esté en http://localhost:3001');
  }
}

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
  const data = await parseJsonResponse(res);

  if (!res.ok) {
    const sentAuth = Boolean(config.headers.Authorization);
    if (res.status === 401 && sentAuth) {
      notifySessionInvalid();
    }
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

export async function getUsersList() {
  return request('/users');
}

export async function createUserAdmin(payload) {
  return request('/users', { method: 'POST', body: payload });
}

export async function resetUserPassword(userId, new_password) {
  return request(`/users/${userId}/password`, {
    method: 'PATCH',
    body: { new_password },
  });
}

/** Sin token: pantalla de login */
export async function requestAccessHelp(body) {
  const res = await fetch(`${API_BASE}/access-help`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await parseJsonResponse(res);
  if (!res.ok) {
    throw new Error(data.error || 'No se pudo enviar la solicitud');
  }
  return data;
}

export async function getAccessHelpRequests() {
  return request('/access-help');
}

export async function resolveAccessHelpRequest(id) {
  return request(`/access-help/${id}/resolve`, { method: 'PATCH' });
}
