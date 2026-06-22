import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const registrarUsuario = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const respuesta = await fetch('http://localhost:8000/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await respuesta.json();
      alert(data.mensaje);

      if (data.mensaje === 'Usuario creado exitosamente') {
        navigate('/loging '); 
      }
    } catch (error) {
      alert("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Crear Cuenta</h2>
        
        <form onSubmit={registrarUsuario} className="space-y-4">
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
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <button
          onClick={() => navigate('/loging')}
          className="w-full mt-4 text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors"
        >
          ¿Ya tienes cuenta? Iniciar Sesión
        </button>
      </div>
    </div>
  );
};

export default Register;