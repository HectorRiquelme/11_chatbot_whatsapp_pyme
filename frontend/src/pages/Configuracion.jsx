import { useState, useEffect } from 'react';
import { obtenerConfig, guardarConfig } from '../api';

export default function Configuracion() {
  const [config, setConfig] = useState({
    system_prompt: '',
    company_name: '',
    horarios: ''
  });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerConfig()
      .then(data => setConfig({
        system_prompt: data.system_prompt || '',
        company_name: data.company_name || '',
        horarios: data.horarios || ''
      }))
      .catch(err => console.error('Error cargando configuración:', err))
      .finally(() => setCargando(false));
  }, []);

  const handleGuardar = async () => {
    setGuardando(true);
    setMensaje('');
    try {
      await guardarConfig(config);
      setMensaje('Configuración guardada correctamente');
      setTimeout(() => setMensaje(''), 3000);
    } catch (err) {
      setMensaje('Error al guardar la configuración');
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <div className="text-center py-12 text-gray-500">Cargando configuración...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuración</h2>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* Nombre empresa */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la empresa
          </label>
          <input
            type="text"
            value={config.company_name}
            onChange={e => setConfig({ ...config, company_name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-teal focus:border-transparent outline-none"
            placeholder="Mi Empresa"
          />
        </div>

        {/* Horarios */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Horarios de atención
          </label>
          <input
            type="text"
            value={config.horarios}
            onChange={e => setConfig({ ...config, horarios: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-teal focus:border-transparent outline-none"
            placeholder="Lunes a Viernes de 9:00 a 18:00"
          />
        </div>

        {/* System Prompt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            System Prompt (instrucciones para la IA)
          </label>
          <textarea
            value={config.system_prompt}
            onChange={e => setConfig({ ...config, system_prompt: e.target.value })}
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-teal focus:border-transparent outline-none resize-y"
            placeholder="Eres el asistente virtual de..."
          />
          <p className="text-xs text-gray-400 mt-1">
            Este prompt define el comportamiento y personalidad del chatbot al interactuar con los clientes.
          </p>
        </div>

        {/* Botón guardar */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="px-6 py-2.5 bg-whatsapp-teal text-white rounded-lg font-medium hover:bg-whatsapp-dark transition-colors disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>

          {mensaje && (
            <span className={`text-sm font-medium ${
              mensaje.includes('Error') ? 'text-red-600' : 'text-green-600'
            }`}>
              {mensaje}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
