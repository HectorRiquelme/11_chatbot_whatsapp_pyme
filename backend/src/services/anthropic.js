const axios = require('axios');
const db = require('../db');

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Obtiene el system prompt configurado desde la base de datos
 */
function obtenerSystemPrompt() {
  const row = db.prepare('SELECT valor FROM configuracion WHERE clave = ?').get('system_prompt');
  return row ? row.valor : 'Eres un asistente virtual profesional.';
}

/**
 * Obtiene los últimos N mensajes de una conversación para contexto
 */
function obtenerHistorial(conversacionId, limite = 10) {
  const mensajes = db.prepare(
    'SELECT rol, contenido FROM mensajes WHERE conversacion_id = ? ORDER BY timestamp DESC LIMIT ?'
  ).all(conversacionId, limite);

  // Invertir para orden cronológico
  return mensajes.reverse().map(m => ({
    role: m.rol === 'user' ? 'user' : 'assistant',
    content: m.contenido
  }));
}

/**
 * Envía mensaje a la API de Anthropic y obtiene respuesta
 */
async function generarRespuesta(conversacionId, mensajeUsuario) {
  const systemPrompt = obtenerSystemPrompt();
  const historial = obtenerHistorial(conversacionId);

  // Agregar el mensaje actual si no está ya en el historial
  const messages = [...historial];
  const ultimoMsg = messages[messages.length - 1];
  if (!ultimoMsg || ultimoMsg.content !== mensajeUsuario || ultimoMsg.role !== 'user') {
    messages.push({ role: 'user', content: mensajeUsuario });
  }

  // Asegurar alternancia correcta de roles
  const messagesFiltrados = [];
  for (let i = 0; i < messages.length; i++) {
    if (i === 0 && messages[i].role === 'assistant') continue;
    if (messagesFiltrados.length > 0 && messagesFiltrados[messagesFiltrados.length - 1].role === messages[i].role) {
      continue;
    }
    messagesFiltrados.push(messages[i]);
  }

  // Asegurar que el último mensaje sea del usuario
  if (messagesFiltrados.length === 0 || messagesFiltrados[messagesFiltrados.length - 1].role !== 'user') {
    messagesFiltrados.push({ role: 'user', content: mensajeUsuario });
  }

  try {
    const response = await axios.post(ANTHROPIC_API_URL, {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messagesFiltrados
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      }
    });

    const textoRespuesta = response.data.content[0].text;
    return textoRespuesta;
  } catch (error) {
    console.error('Error al llamar a Anthropic:', error.response?.data || error.message);
    return 'Lo siento, estoy teniendo dificultades técnicas. Por favor intenta de nuevo en unos momentos.';
  }
}

module.exports = { generarRespuesta, obtenerSystemPrompt };
