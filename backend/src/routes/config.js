const { Router } = require('express');
const db = require('../db');

const router = Router();

/**
 * GET /api/config — Obtener configuración actual
 */
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT clave, valor FROM configuracion').all();
  const config = {};
  for (const row of rows) {
    config[row.clave] = row.valor;
  }
  res.json(config);
});

/**
 * POST /api/config — Actualizar configuración
 * Body esperado: { system_prompt, company_name, horarios }
 */
router.post('/', (req, res) => {
  const { system_prompt, company_name, horarios } = req.body;

  const upsert = db.prepare('INSERT INTO configuracion (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor');

  const actualizarConfig = db.transaction(() => {
    if (system_prompt !== undefined) upsert.run('system_prompt', system_prompt);
    if (company_name !== undefined) upsert.run('company_name', company_name);
    if (horarios !== undefined) upsert.run('horarios', horarios);
  });

  actualizarConfig();

  // Devolver configuración actualizada
  const rows = db.prepare('SELECT clave, valor FROM configuracion').all();
  const config = {};
  for (const row of rows) {
    config[row.clave] = row.valor;
  }

  res.json({ mensaje: 'Configuración actualizada', config });
});

module.exports = router;
