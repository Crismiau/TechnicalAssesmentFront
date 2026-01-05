import { useState } from 'react';
import Dashboard from './components/dashboard';
import Auth from './components/login';

export default function App() {
  const [logged, setLogged] = useState(!!localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLogged(false);
  };

  if (!logged) return <Auth onLoginSuccess={() => setLogged(true)} />;

  return (
    <div>
      <header className="p-4 border-b flex justify-end">
        <button onClick={handleLogout} className="px-3 py-1 bg-red-600 text-white rounded">Cerrar sesión</button>
      </header>
      <Dashboard />
    </div>
  );
}