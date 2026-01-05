import { useState } from 'react';
import api from '../api/axios';

export default function Auth({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ email: '', password: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const tryPost = async (paths, data) => {
                let lastErr = null;
                for (const p of paths) {
                    try {
                        return await api.post(p, data);
                    } catch (err) {
                        lastErr = err;
                        // si 404, probar siguiente ruta; en otros casos, romper
                        if (err.response && err.response.status === 404) continue;
                        throw err;
                    }
                }
                throw lastErr;
            };

            if (isLogin) {
                // intentar rutas comunes de login
                const res = await tryPost(['/auth/login', '/login'], form);
                localStorage.setItem('token', res.data.token);
                onLoginSuccess();
            } else {
                // intentar rutas comunes de register
                await tryPost(['/auth/register', '/register'], form);
                alert('Registro exitoso, ahora puedes iniciar sesión');
                setIsLogin(true);
            }
        } catch (err) {
            console.error('Auth error:', err);
            const status = err?.response?.status;
            const msg = err?.response?.data?.message || err.message || 'Error desconocido';
            if (isLogin) {
                alert(`Error en credenciales (${status || 'no status'}): ${msg}`);
            } else {
                alert(`Error al registrar usuario (${status || 'no status'}): ${msg}`);
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
            <form onSubmit={handleSubmit} className="p-8 bg-white shadow-xl rounded-2xl w-96 border border-gray-100">
                <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800">
                    {isLogin ? 'Bienvenido' : 'Crear Cuenta'}
                </h2>
                
                <div className="space-y-4">
                    <input 
                        type="email" 
                        placeholder="Email" 
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={e => setForm({...form, email: e.target.value})} 
                    />
                    <input 
                        type="password" 
                        placeholder="Contraseña" 
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={e => setForm({...form, password: e.target.value})} 
                    />
                    <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition">
                        {isLogin ? 'Entrar' : 'Registrarme'}
                    </button>
                </div>

                <p className="mt-6 text-center text-sm text-gray-600">
                    {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"} 
                    <button 
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="ml-2 text-blue-600 font-bold hover:underline"
                    >
                        {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
                    </button>
                </p>
            </form>
        </div>
    );
}