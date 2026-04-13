const axios = require('axios');

const GRAPH_API_URL = 'https://graph.facebook.com/v17.0';

/**
 * Envía un mensaje de texto vía WhatsApp Business Cloud API
 */
async function enviarMensaje(destinatario, texto) {
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  const url = `${GRAPH_API_URL}/${phoneNumberId}/messages`;

  try {
    const response = await axios.post(url, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: destinatario,
      type: 'text',
      text: { body: texto }
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Mensaje enviado a ${destinatario}:`, response.data);
    return response.data;
  } catch (error) {
    console.error('Error al enviar mensaje WhatsApp:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Parsea el payload entrante del webhook de Meta
 * Retorna un array de mensajes extraídos
 */
function parsearPayload(body) {
  const mensajes = [];

  if (body.object !== 'whatsapp_business_account') return mensajes;

  const entries = body.entry || [];
  for (const entry of entries) {
    const changes = entry.changes || [];
    for (const change of changes) {
      if (change.field !== 'messages') continue;
      const value = change.value || {};
      const incomingMessages = value.messages || [];
      const contacts = value.contacts || [];

      for (const msg of incomingMessages) {
        const contacto = contacts.find(c => c.wa_id === msg.from) || {};
        mensajes.push({
          from: msg.from,
          nombre: contacto.profile?.name || '',
          text: msg.text?.body || '',
          timestamp: msg.timestamp,
          message_id: msg.id,
          message_type: msg.type
        });
      }
    }
  }

  return mensajes;
}

module.exports = { enviarMensaje, parsearPayload };
