import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerConversaciones } from '../api';

const ESTADOS = [
  { valor: '', label: 'Todas' },
  { valor: 'activa', label: 'Activas' },
  { valor: 'escalada', label: 'Escaladas' },
  { valor: 'cerrada', label: 'Cerradas' }
];

const badgeEstado = {
  activa: 'bg-green-100 text-green-800',
  escalada: 'bg-orange-100 text-orange-800',
  cerrada: 'bg-gray-100 text-gray-600'
};

export default function Conversaciones() {
  const [conversaciones, setConversaciones] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setCargando(true);
    obtenerConversaciones(filtro || undefined)
      .then(setConversaciones)
      .catch(err => console.error('Error cargando conversaciones:', err))
      .finally(() => setCargando(false));
  }, [filtro]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Conversaciones</h2>
        <div className="flex gap-2">
          {ESTADOS.map(e => (
            <button
              key={e.valor}
              onClick={() => setFiltro(e.valor)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filtro === e.valor
                  ? 'bg-whatsapp-teal text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border'
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {cargando ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : conversaciones.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No hay conversaciones {filtro && `con estado "${filtro}"`}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm divide-y">
          {conversaciones.map(conv => (
            <div
              key={conv.id}
              onClick={() => navigate(`/chat/${conv.id}`)}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-whatsapp-teal flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {(conv.nombre || conv.wa_number).charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 truncate">
                    {conv.nombre || conv.wa_number}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeEstado[conv.estado]}`}>
                    {conv.estado}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate mt-0.5">
                  {conv.ultimo_mensaje?.contenido || 'Sin mensajes'}
                </p>
              </div>

              {/* Timestamp */}
              <div className="text-xs text-gray-400 flex-shrink-0">
                {new Date(conv.updated_at).toLocaleString('es-CL', {
                  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
