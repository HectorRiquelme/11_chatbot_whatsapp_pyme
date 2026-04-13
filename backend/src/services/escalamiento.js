const { enviarNotificacionEscalamiento } = require('./email');

// Palabras clave que indican intención de hablar con un humano
const KEYWORDS_ESCALAMIENTO = [
  'hablar con humano',
  'hablar con una persona',
  'hablar con alguien',
  'agente humano',
  'agente real',
  'persona real',
  'operador',
  'ejecutivo',
  'representante',
  'quiero hablar con alguien',
  'necesito un humano',
  'atencion humana',
  'atención humana',
  'hablar con agente',
  'contactar agente',
  'persona de verdad'
];

/**
 * Detecta si el mensaje del usuario indica intención de escalamiento
 */
function detectarEscalamiento(texto) {
  const textoNormalizado = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  for (const keyword of KEYWORDS_ESCALAMIENTO) {
    const keywordNormalizada = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (textoNormalizado.includes(keywordNormalizada)) {
      return true;
    }
  }

  return false;
}

/**
 * Procesa un escalamiento: actualiza estado y notifica por email
 */
async function procesarEscalamiento(db, conversacionId, waNumber, nombre, ultimoMensaje) {
  // Actualizar estado de la conversación
  db.prepare("UPDATE conversaciones SET estado = 'escalada', updated_at = datetime('now') WHERE id = ?")
    .run(conversacionId);

  // Guardar mensaje de sistema
  db.prepare("INSERT INTO mensajes (conversacion_id, rol, contenido) VALUES (?, 'system', ?)")
    .run(conversacionId, 'Conversación escalada a agente humano');

  // Enviar notificación por email
  await enviarNotificacionEscalamiento({ waNumber, nombre, ultimoMensaje });
}

const RESPUESTA_ESCALAMIENTO = 'Entiendo que prefieres hablar con una persona. Voy a derivar tu conversación a uno de nuestros ejecutivos. Te contactarán lo antes posible. ¡Gracias por tu paciencia!';

module.exports = { detectarEscalamiento, procesarEscalamiento, RESPUESTA_ESCALAMIENTO };
