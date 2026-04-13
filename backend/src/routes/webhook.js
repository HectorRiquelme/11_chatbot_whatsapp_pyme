const { Router } = require('express');
const db = require('../db');
const { parsearPayload, enviarMensaje } = require('../services/whatsapp');
const { generarRespuesta } = require('../services/openai');
const { detectarEscalamiento, procesarEscalamiento, RESPUESTA_ESCALAMIENTO } = require('../services/escalamiento');

const router = Router();

/**
 * GET /webhook — Verificación del webhook de Meta
 */
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    console.log('Webhook verificado correctamente');
    return res.status(200).send(challenge);
  }

  console.warn('Verificación de webhook fallida');
  return res.sendStatus(403);
});

/**
 * POST /webhook — Recepción de mensajes entrantes de WhatsApp
 */
router.post('/', async (req, res) => {
  // Responder 200 inmediatamente para no bloquear Meta
  res.sendStatus(200);

  try {
    const mensajes = parsearPayload(req.body);

    for (const msg of mensajes) {
      // Solo procesar mensajes de texto
      if (msg.message_type !== 'text' || !msg.text) continue;

      console.log(`Mensaje recibido de ${msg.from}: ${msg.text}`);

      // Obtener o crear conversación
      let conversacion = db.prepare(
        "SELECT * FROM conversaciones WHERE wa_number = ? AND estado != 'cerrada' ORDER BY created_at DESC LIMIT 1"
      ).get(msg.from);

      if (!conversacion) {
        const result = db.prepare(
          "INSERT INTO conversaciones (wa_number, nombre) VALUES (?, ?)"
        ).run(msg.from, msg.nombre);
        conversacion = db.prepare('SELECT * FROM conversaciones WHERE id = ?').get(result.lastInsertRowid);
      } else if (msg.nombre && msg.nombre !== conversacion.nombre) {
        db.prepare("UPDATE conversaciones SET nombre = ?, updated_at = datetime('now') WHERE id = ?")
          .run(msg.nombre, conversacion.id);
      }

      // Guardar mensaje del usuario
      db.prepare("INSERT INTO mensajes (conversacion_id, rol, contenido) VALUES (?, 'user', ?)")
        .run(conversacion.id, msg.text);

      // Actualizar timestamp de conversación
      db.prepare("UPDATE conversaciones SET updated_at = datetime('now') WHERE id = ?")
        .run(conversacion.id);

      // Si la conversación ya está escalada, no responder automáticamente
      if (conversacion.estado === 'escalada') {
        console.log(`Conversación ${conversacion.id} está escalada, no se responde automáticamente`);
        continue;
      }

      let respuesta;

      // Detectar intención de escalamiento
      if (detectarEscalamiento(msg.text)) {
        respuesta = RESPUESTA_ESCALAMIENTO;
        await procesarEscalamiento(db, conversacion.id, msg.from, msg.nombre, msg.text);
      } else {
        // Generar respuesta con IA
        respuesta = await generarRespuesta(conversacion.id, msg.text);
      }

      // Guardar respuesta del asistente
      db.prepare("INSERT INTO mensajes (conversacion_id, rol, contenido) VALUES (?, 'assistant', ?)")
        .run(conversacion.id, respuesta);

      // Enviar respuesta por WhatsApp
      await enviarMensaje(msg.from, respuesta);
    }
  } catch (error) {
    console.error('Error procesando webhook:', error);
  }
});

module.exports = router;
