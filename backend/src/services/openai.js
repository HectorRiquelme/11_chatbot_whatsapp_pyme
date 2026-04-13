const axios = require('axios');
const db = require('../db');

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

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
 * Envía mensaje a la API de OpenAI y obtiene respuesta
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

  // Agregar system prompt al inicio
  const allMessages = [
    { role: 'system', content: systemPrompt },
    ...messagesFiltrados
  ];

  try {
    const response = await axios.post(OPENAI_API_URL, {
      model: 'gpt-4o',
      max_tokens: 1024,
      messages: allMessages
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    const textoRespuesta = response.data.choices[0].message.content;
    return textoRespuesta;
  } catch (error) {
    console.error('Error al llamar a OpenAI:', error.response?.data || error.message);
    return 'Lo siento, estoy teniendo dificultades técnicas. Por favor intenta de nuevo en unos momentos.';
  }
}

module.exports = { generarRespuesta, obtenerSystemPrompt };
