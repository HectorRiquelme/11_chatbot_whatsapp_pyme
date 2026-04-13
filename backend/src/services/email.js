const nodemailer = require('nodemailer');

let transporter = null;

function obtenerTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return transporter;
}

/**
 * Envía un correo de notificación de escalamiento
 */
async function enviarNotificacionEscalamiento({ waNumber, nombre, ultimoMensaje }) {
  const transport = obtenerTransporter();
  const adminEmail = process.env.ADMIN_EMAIL;
  const companyName = process.env.COMPANY_NAME || 'Mi Empresa';

  const mailOptions = {
    from: `"Chatbot ${companyName}" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `🔔 Escalamiento: ${nombre || waNumber} solicita atención humana`,
    html: `
      <h2>Solicitud de escalamiento</h2>
      <p><strong>Cliente:</strong> ${nombre || 'Sin nombre'}</p>
      <p><strong>Número WhatsApp:</strong> ${waNumber}</p>
      <p><strong>Último mensaje:</strong> ${ultimoMensaje}</p>
      <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CL')}</p>
      <hr>
      <p>Por favor atienda esta conversación lo antes posible.</p>
    `
  };

  try {
    await transport.sendMail(mailOptions);
    console.log(`Notificación de escalamiento enviada a ${adminEmail}`);
  } catch (error) {
    console.error('Error al enviar email de escalamiento:', error.message);
  }
}

module.exports = { enviarNotificacionEscalamiento };
