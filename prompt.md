# Prompt 2 - Chatbot WhatsApp para atencion al cliente PYME

**Stack:** Node.js, Express, WhatsApp Business API, API Anthropic, SQLite

---

Crea un chatbot real de WhatsApp usando la WhatsApp Business Cloud API de Meta. Node.js + Express. Implementa: 1) webhook verificacion de Meta (GET /webhook con verify_token), 2) recepcion de mensajes entrantes (POST /webhook), 3) envio de respuestas via API de WhatsApp (POST /v17.0/:phone_id/messages), 4) cada mensaje del usuario se envia a la API de Anthropic con system prompt de la empresa, 5) respuesta de Claude se envia de vuelta por WhatsApp, 6) deteccion de intencion: si el usuario dice "hablar con humano" o similar, se escala y notifica por email. SQLite para historial. Panel admin React con conversaciones y metricas. README: crear app en Meta for Developers, configurar WhatsApp Business test number, obtener access token, configurar webhook con ngrok para desarrollo local.

---

**IMPORTANTE:** No incluyas referencias a Claude, Claude Code, Anthropic ni ningun asistente IA en commits, README, package.json, comentarios de codigo ni en ningun archivo del proyecto. El unico autor debe ser "Hector Riquelme" con el email y usuario de GitHub "HectorRiquelme".
