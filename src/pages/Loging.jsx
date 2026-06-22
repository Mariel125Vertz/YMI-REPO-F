import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Loging = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const iniciarSesion = async (e) => {
    e.preventDefault();
    setLoading(true);

    const respuesta = await fetch('`${import.meta.env.VITE_API_URL}/login`', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await respuesta.json();
    setLoading(false);

    if (data.mensaje === 'Login correcto') {
      localStorage.setItem('id_usuario', data.id_usuario);
      localStorage.removeItem('es_premium');
      navigate('/tarea');
    } else {
      alert(data.mensaje);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Bienvenido</h2>
        
        <form onSubmit={iniciarSesion} className="space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md active:scale-95"
          >
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿Aún no tienes cuenta? 
          <Link to="/register" className="text-indigo-600 font-semibold hover:underline ml-1">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Loging;