require('dotenv').config();

const express = require('express');
const cors = require('cors');
const webhookRoutes = require('./routes/webhook');
const conversacionesRoutes = require('./routes/conversaciones');
const configRoutes = require('./routes/config');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/webhook', webhookRoutes);
app.use('/api/conversaciones', conversacionesRoutes);
app.use('/api/config', configRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
  console.log(`Webhook URL: http://localhost:${PORT}/webhook`);
});
