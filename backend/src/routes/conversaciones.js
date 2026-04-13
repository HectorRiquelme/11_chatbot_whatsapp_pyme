const { Router } = require('express');
const db = require('../db');

const router = Router();

/**
 * GET /api/conversaciones — Listar conversaciones con filtros
 */
router.get('/', (req, res) => {
  const { estado } = req.query;

  let query = 'SELECT * FROM conversaciones';
  const params = [];

  if (estado) {
    query += ' WHERE estado = ?';
    params.push(estado);
  }

  query += ' ORDER BY updated_at DESC';

  const conversaciones = db.prepare(query).all(...params);

  // Agregar último mensaje a cada conversación
  const stmtUltimoMsg = db.prepare(
    'SELECT contenido, rol, timestamp FROM mensajes WHERE conversacion_id = ? ORDER BY timestamp DESC LIMIT 1'
  );

  const resultado = conversaciones.map(conv => {
    const ultimoMsg = stmtUltimoMsg.get(conv.id);
    return { ...conv, ultimo_mensaje: ultimoMsg || null };
  });

  res.json(resultado);
});

/**
 * GET /api/conversaciones/:id — Detalle de conversación con mensajes
 */
router.get('/:id', (req, res) => {
  const conversacion = db.prepare('SELECT * FROM conversaciones WHERE id = ?').get(req.params.id);

  if (!conversacion) {
    return res.status(404).json({ error: 'Conversación no encontrada' });
  }

  const mensajes = db.prepare(
    'SELECT * FROM mensajes WHERE conversacion_id = ? ORDER BY timestamp ASC'
  ).all(req.params.id);

  res.json({ ...conversacion, mensajes });
});

/**
 * PATCH /api/conversaciones/:id — Actualizar estado de conversación
 */
router.patch('/:id', (req, res) => {
  const { estado } = req.body;

  if (!['activa', 'escalada', 'cerrada'].includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  db.prepare("UPDATE conversaciones SET estado = ?, updated_at = datetime('now') WHERE id = ?")
    .run(estado, req.params.id);

  const conversacion = db.prepare('SELECT * FROM conversaciones WHERE id = ?').get(req.params.id);
  res.json(conversacion);
});

/**
 * GET /api/metricas — Métricas del dashboard
 */
router.get('/stats/metricas', (req, res) => {
  const totalConversaciones = db.prepare('SELECT COUNT(*) as total FROM conversaciones').get().total;

  const escaldasHoy = db.prepare(
    "SELECT COUNT(*) as total FROM conversaciones WHERE estado = 'escalada' AND date(updated_at) = date('now')"
  ).get().total;

  const mensajesHoy = db.prepare(
    "SELECT COUNT(*) as total FROM mensajes WHERE date(timestamp) = date('now')"
  ).get().total;

  const activasTotal = db.prepare(
    "SELECT COUNT(*) as total FROM conversaciones WHERE estado = 'activa'"
  ).get().total;

  const escaladasTotal = db.prepare(
    "SELECT COUNT(*) as total FROM conversaciones WHERE estado = 'escalada'"
  ).get().total;

  res.json({
    total_conversaciones: totalConversaciones,
    escaladas_hoy: escaldasHoy,
    mensajes_hoy: mensajesHoy,
    activas: activasTotal,
    escaladas: escaladasTotal
  });
});

module.exports = router;
