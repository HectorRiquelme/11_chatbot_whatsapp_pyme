import { useState, useEffect } from 'react';
import { obtenerMetricas } from '../api';

const tarjetas = [
  { clave: 'total_conversaciones', label: 'Total conversaciones', color: 'bg-blue-500', icono: '💬' },
  { clave: 'activas', label: 'Activas ahora', color: 'bg-green-500', icono: '🟢' },
  { clave: 'escaladas', label: 'Escaladas (total)', color: 'bg-orange-500', icono: '🔔' },
  { clave: 'escaladas_hoy', label: 'Escaladas hoy', color: 'bg-red-500', icono: '🚨' },
  { clave: 'mensajes_hoy', label: 'Mensajes hoy', color: 'bg-purple-500', icono: '📨' }
];

export default function Metricas() {
  const [metricas, setMetricas] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerMetricas()
      .then(setMetricas)
      .catch(err => console.error('Error cargando métricas:', err))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return <div className="text-center py-12 text-gray-500">Cargando métricas...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Métricas</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tarjetas.map(t => (
          <div key={t.clave} className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
            <div className={`w-14 h-14 ${t.color} rounded-xl flex items-center justify-center text-2xl`}>
              {t.icono}
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{metricas?.[t.clave] ?? 0}</p>
              <p className="text-sm text-gray-500">{t.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Resumen</h3>
        <p className="text-gray-600">
          El chatbot ha gestionado <strong>{metricas?.total_conversaciones ?? 0}</strong> conversaciones en total.
          Actualmente hay <strong>{metricas?.activas ?? 0}</strong> conversaciones activas
          y <strong>{metricas?.escaladas ?? 0}</strong> pendientes de atención humana.
          Hoy se han procesado <strong>{metricas?.mensajes_hoy ?? 0}</strong> mensajes.
        </p>
      </div>
    </div>
  );
}
