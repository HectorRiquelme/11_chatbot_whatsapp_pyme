const API_BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return res.json();
}

export function obtenerConversaciones(estado) {
  const params = estado ? `?estado=${estado}` : '';
  return request(`/conversaciones${params}`);
}

export function obtenerConversacion(id) {
  return request(`/conversaciones/${id}`);
}

export function actualizarConversacion(id, datos) {
  return request(`/conversaciones/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(datos)
  });
}

export function obtenerMetricas() {
  return request('/conversaciones/stats/metricas');
}

export function obtenerConfig() {
  return request('/config');
}

export function guardarConfig(config) {
  return request('/config', {
    method: 'POST',
    body: JSON.stringify(config)
  });
}
