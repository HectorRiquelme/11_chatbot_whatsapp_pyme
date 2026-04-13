const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'chatbot.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS conversaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wa_number TEXT NOT NULL,
    nombre TEXT DEFAULT '',
    estado TEXT NOT NULL DEFAULT 'activa' CHECK(estado IN ('activa', 'escalada', 'cerrada')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS mensajes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversacion_id INTEGER NOT NULL,
    rol TEXT NOT NULL CHECK(rol IN ('user', 'assistant', 'system')),
    contenido TEXT NOT NULL,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id)
  );

  CREATE TABLE IF NOT EXISTS configuracion (
    clave TEXT PRIMARY KEY,
    valor TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_conversaciones_wa_number ON conversaciones(wa_number);
  CREATE INDEX IF NOT EXISTS idx_conversaciones_estado ON conversaciones(estado);
  CREATE INDEX IF NOT EXISTS idx_mensajes_conversacion ON mensajes(conversacion_id);
`);

// Insertar configuración por defecto si no existe
const insertConfig = db.prepare('INSERT OR IGNORE INTO configuracion (clave, valor) VALUES (?, ?)');
insertConfig.run('system_prompt', `Eres el asistente virtual de ${process.env.COMPANY_NAME || 'nuestra empresa'}. Horarios de atención: Lunes a Viernes de 9:00 a 18:00. Responde de forma amable, concisa y profesional. Si no puedes resolver algo, sugiere hablar con un agente humano.`);
insertConfig.run('company_name', process.env.COMPANY_NAME || 'Mi Empresa');
insertConfig.run('horarios', 'Lunes a Viernes de 9:00 a 18:00');

module.exports = db;
