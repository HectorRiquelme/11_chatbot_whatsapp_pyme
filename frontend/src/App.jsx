import { Routes, Route, NavLink } from 'react-router-dom';
import Conversaciones from './pages/Conversaciones';
import Chat from './pages/Chat';
import Metricas from './pages/Metricas';
import Configuracion from './pages/Configuracion';

const navItems = [
  { to: '/', label: 'Conversaciones' },
  { to: '/metricas', label: 'Métricas' },
  { to: '/configuracion', label: 'Configuración' }
];

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Barra superior */}
      <header className="bg-whatsapp-dark text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            Panel Admin — Chatbot WhatsApp
          </h1>
          <nav className="flex gap-1">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4">
        <Routes>
          <Route path="/" element={<Conversaciones />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/metricas" element={<Metricas />} />
          <Route path="/configuracion" element={<Configuracion />} />
        </Routes>
      </main>
    </div>
  );
}
