# Chatbot WhatsApp para PyMEs

Chatbot inteligente para WhatsApp Business con panel de administración. Responde automáticamente a clientes usando IA, detecta solicitudes de escalamiento a humanos y notifica por email.

## Stack

- **Backend:** Node.js + Express + SQLite (better-sqlite3)
- **Frontend:** React + Vite + Tailwind CSS
- **IA:** API de OpenAI (GPT-4o) para generación de respuestas
- **Mensajería:** WhatsApp Business Cloud API de Meta
- **Notificaciones:** Nodemailer (SMTP)

## Requisitos previos

- Node.js 18+
- Cuenta de WhatsApp Business con Cloud API configurada en Meta for Developers
- API key de OpenAI
- Servidor SMTP para notificaciones por email

## Instalación

```bash
# Backend
cd backend
cp .env.example .env   # Editar con tus credenciales
npm install
npm run dev

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

El backend corre en `http://localhost:3001` y el frontend en `http://localhost:5173`.

## Configuración de Meta

1. Crear app en [Meta for Developers](https://developers.facebook.com/)
2. Agregar producto "WhatsApp"
3. Configurar webhook apuntando a `https://tu-dominio.com/webhook`
4. Usar el `META_VERIFY_TOKEN` definido en `.env`
5. Suscribirse al campo `messages`

## Variables de entorno

Ver `.env.example` para la lista completa de variables requeridas.

## Funcionalidades

- Recepción y respuesta automática de mensajes vía WhatsApp
- Contexto conversacional (últimos 10 mensajes)
- Detección de intención de escalamiento a humano
- Notificación por email cuando un cliente solicita agente
- Panel admin: listado de conversaciones, vista de chat, métricas
- Configuración del system prompt, nombre de empresa y horarios
