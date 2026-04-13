import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerConversacion, actualizarConversacion } from '../api';

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conversacion, setConversacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    setCargando(true);
    obtenerConversacion(id)
      .then(setConversacion)
      .catch(err => {
        console.error('Error cargando conversación:', err);
        navigate('/');
      })
      .finally(() => setCargando(false));
  }, [id, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversacion?.mensajes]);

  const cambiarEstado = async (nuevoEstado) => {
    try {
      await actualizarConversacion(id, { estado: nuevoEstado });
      setConversacion(prev => ({ ...prev, estado: nuevoEstado }));
    } catch (err) {
      console.error('Error actualizando estado:', err);
    }
  };

  if (cargando) {
    return <div className="text-center py-12 text-gray-500">Cargando conversación...</div>;
  }

  if (!conversacion) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Cabecera del chat */}
      <div className="bg-whatsapp-dark text-white p-4 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-white/70 hover:text-white transition-colors"
          >
            ← Volver
          </button>
          <div className="w-10 h-10 rounded-full bg-whatsapp-green flex items-center justify-center text-white font-bold">
            {(conversacion.nombre || conversacion.wa_number).charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold">{conversacion.nombre || conversacion.wa_number}</div>
            <div className="text-xs text-white/60">{conversacion.wa_number}</div>
          </div>
        </div>

        <div className="flex gap-2">
          {conversacion.estado !== 'cerrada' && (
            <button
              onClick={() => cambiarEstado('cerrada')}
              className="px-3 py-1.5 bg-red-500/20 text-red-200 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
            >
              Cerrar
            </button>
          )}
          {conversacion.estado === 'escalada' && (
            <button
              onClick={() => cambiarEstado('activa')}
              className="px-3 py-1.5 bg-green-500/20 text-green-200 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
            >
              Reactivar
            </button>
          )}
          <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            conversacion.estado === 'activa' ? 'bg-green-500/20 text-green-200' :
            conversacion.estado === 'escalada' ? 'bg-orange-500/20 text-orange-200' :
            'bg-gray-500/20 text-gray-300'
          }`}>
            {conversacion.estado}
          </span>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#ece5dd]">
        {conversacion.mensajes?.map(msg => (
          <div
            key={msg.id}
            className={`flex ${
              msg.rol === 'user' ? 'justify-end' :
              msg.rol === 'system' ? 'justify-center' : 'justify-start'
            }`}
          >
            <div className={
              msg.rol === 'user' ? 'chat-bubble-user' :
              msg.rol === 'system' ? 'chat-bubble-system' :
              'chat-bubble-assistant'
            }>
              <p className="text-sm whitespace-pre-wrap">{msg.contenido}</p>
              <p className={`text-xs mt-1 ${
                msg.rol === 'system' ? 'text-yellow-600' : 'text-gray-400'
              }`}>
                {new Date(msg.timestamp).toLocaleTimeString('es-CL', {
                  hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Pie informativo */}
      <div className="bg-gray-100 p-3 rounded-b-xl text-center text-sm text-gray-500">
        Las respuestas son generadas automáticamente por el chatbot.
        {conversacion.estado === 'escalada' && (
          <span className="text-orange-600 font-medium"> — Conversación esperando atención humana.</span>
        )}
      </div>
    </div>
  );
}
