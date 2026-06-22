import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { Sparkles, Infinity } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Premium = () => {
  const [esPremium, setEsPremium] = useState(() => localStorage.getItem('es_premium') === '1');
  const [activando, setActivando] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const status = searchParams.get('status');
    const id_usuario = localStorage.getItem('id_usuario');

    if (!id_usuario) return;

    if (status === 'success') {
      setActivando(true);

      fetch(`${import.meta.env.VITE_API_URL}/activar-premium/${id_usuario}`, { method: 'POST' })
        .then(r => r.json())
        .then(data => {
          setActivando(false);
          if (data.mensaje === "Premium activado") {
            localStorage.setItem('es_premium', '1');
            setEsPremium(true);
            alert("¡Pago exitoso! Ahora eres usuario Premium.");
            navigate('/premium', { replace: true });
          }
        })
        .catch(() => setActivando(false));

    } else {
      fetch(`${import.meta.env.VITE_API_URL}/es-premium/${id_usuario}`)
        .then(r => r.json())
        .then(data => {
          setEsPremium(data.es_premium);
          if (data.es_premium) {
            localStorage.setItem('es_premium', '1');
          } else {
            localStorage.removeItem('es_premium');
          }
        });
    }
  }, [searchParams, navigate]);

  const handlePremium = async () => {
    try {
      const res =await fetch(`${import.meta.env.VITE_API_URL}/crear-preferencia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: localStorage.getItem("id_usuario") })
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Error: " + (data.error || "No se recibió URL"));
      }
    } catch (err) {
      console.error("Error al conectar:", err);
      alert("No se pudo conectar con el servidor.");
    }
  };

  const beneficios = [
    { icon: <Infinity size={20} />, texto: 'Exporta tus tareas en PDF' },
    { icon: <Infinity size={20} />, texto: 'Exporta tus notas en PDF' },
  ];

  if (activando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Activando tu cuenta Premium...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Header />
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm w-full max-w-sm p-8 flex flex-col items-center text-center">

          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mb-5">
            <Sparkles size={32} className="text-violet-600" />
          </div>

          <p className="text-xs text-violet-500 font-semibold uppercase tracking-widest mb-1">YMI</p>
          <h1 className="text-2xl font-bold text-gray-800 font-serif mb-1">Plan Premium</h1>
          <p className="text-gray-400 text-sm mb-6">Lleva tu productividad al siguiente nivel</p>

          <div className="mb-6">
            <span className="text-5xl font-black text-gray-800">$99</span>
            <span className="text-gray-400 text-sm ml-1">/ mes</span>
          </div>

          <ul className="w-full space-y-3 mb-8">
            {beneficios.map((b, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                <span className="w-8 h-8 bg-violet-50 text-violet-500 rounded-xl flex items-center justify-center shrink-0">
                  {b.icon}
                </span>
                {b.texto}
              </li>
            ))}
          </ul>

          {esPremium ? (
            <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold py-3 rounded-xl text-center">
              ✓ Ya eres Premium
            </div>
          ) : (
            <button
              onClick={handlePremium}
              className="w-full bg-violet-600 hover:bg-violet-700 active:scale-95 transition-all text-white font-semibold py-3 rounded-xl shadow-md"
            >
              Obtener Premium
            </button>
          )}

          <p className="text-xs text-gray-300 mt-4">Cancela cuando quieras · Sin compromisos</p>
        </div>
      </div>
    </div>
  );
};

export default Premium;