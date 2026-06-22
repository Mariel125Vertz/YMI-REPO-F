import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { PencilSparkles, Trash2, FileDown } from "lucide-react";
import jsPDF from 'jspdf';

const Notas = () => {
  const [modalAbierto, setModalAbierto]       = useState(false);
  const [modalEditar, setModalEditar]         = useState(false);
  const [notaEditando, setNotaEditando]       = useState(null);
  const [titulo, setTitulo]                   = useState("");
  const [descripcion, setDescripcion]         = useState("");
  const [editTitulo, setEditTitulo]           = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [listaNotas, setListaNotas]           = useState([]);
  const [cargando, setCargando]               = useState(false);
  const [esPremium, setEsPremium]             = useState(false);

  const navigate   = useNavigate();
  const id_usuario = localStorage.getItem('id_usuario');

  useEffect(() => {
    if (!id_usuario) { navigate('/loging'); return; }

    // Verificar si es premium (primero desde localStorage, luego desde la API)
    const premiumLocal = localStorage.getItem('es_premium');
    if (premiumLocal === '1') {
      setEsPremium(true);
    } else {
      fetch(`http://localhost:8000/es-premium/${id_usuario}`)
        .then(r => r.json())
        .then(data => {
          if (data.es_premium) {
            setEsPremium(true);
            localStorage.setItem('es_premium', '1');
          }
        })
        .catch(() => {});
    }

    const obtenerNotas = async () => {
      try {
        const respuesta = await fetch(`http://localhost:8000/notas/${id_usuario}`);
        const data = await respuesta.json();
        if (respuesta.ok) {
          setListaNotas(data.map(n => ({
            id: n.id_notas,
            titulo: n.titulo,
            descripcion: n.descripcion
          })));
        }
      } catch (err) { console.error(err); }
    };

    obtenerNotas();
  }, [id_usuario, navigate]);

  const cerrarModal = () => {
    setModalAbierto(false);
    setTitulo(""); setDescripcion("");
  };

  const abrirEditar = (nota) => {
    setNotaEditando(nota);
    setEditTitulo(nota.titulo);
    setEditDescripcion(nota.descripcion || "");
    setModalEditar(true);
  };

  const cerrarEditar = () => {
    setModalEditar(false);
    setNotaEditando(null);
  };

  const agregarNota = async (e) => {
    e.preventDefault();
    if (!id_usuario) return;
    setCargando(true);
    try {
      const respuesta = await fetch(`http://localhost:8000/agregar-nota/${id_usuario}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descripcion })
      });
      const data = await respuesta.json();
      setCargando(false);
      if (data.mensaje === 'Nota agregada exitosamente') {
        setListaNotas(prev => [...prev, { id: data.id, titulo, descripcion }]);
        cerrarModal();
      } else { alert(data.mensaje); }
    } catch { setCargando(false); alert("Error de conexión"); }
  };

  const eliminarNota = async (id_nota) => {
    if (!window.confirm("¿Eliminar esta nota?")) return;
    try {
      const respuesta = await fetch(`http://localhost:8000/eliminar-nota/${id_usuario}/${id_nota}`, {
        method: 'DELETE'
      });
      const data = await respuesta.json();
      if (respuesta.ok) {
        setListaNotas(prev => prev.filter(n => Number(n.id) !== Number(id_nota)));
      } else { alert(data.mensaje); }
    } catch { alert("Error de conexión"); }
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();
    if (!notaEditando) return;
    setCargando(true);
    try {
      const respuesta = await fetch(`http://localhost:8000/editar-nota/${id_usuario}/${notaEditando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: editTitulo, descripcion: editDescripcion })
      });
      const data = await respuesta.json();
      setCargando(false);
      if (respuesta.ok) {
        setListaNotas(prev => prev.map(n =>
          Number(n.id) === Number(notaEditando.id)
            ? { ...n, titulo: editTitulo, descripcion: editDescripcion }
            : n
        ));
        cerrarEditar();
      } else { alert(data.mensaje); }
    } catch { setCargando(false); alert("Error de conexión"); }
  };

  // ── Descarga PDF de una sola nota (solo premium) ─────────────────────────
  const descargarNotaPDF = (nota) => {
    if (!esPremium) {
      navigate('/premium');
      return;
    }

    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text("Nota – YMI", 14, y);
    y += 12;

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Título: ${nota.titulo}`, 14, y);
    y += 10;

    doc.setFont(undefined, 'normal');
    const descLines = doc.splitTextToSize(`Descripción: ${nota.descripcion || 'Sin descripción'}`, 180);
    doc.text(descLines, 14, y);

    doc.save(`nota-${nota.titulo.replace(/\s+/g, '_').toLowerCase()}.pdf`);
  };

  const colores = [
    'border-t-violet-300',  'border-t-fuchsia-300',
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Header />

      <div className="flex-1 p-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs text-violet-500 font-semibold uppercase tracking-widest mb-1">Mis notas</p>
            <h1 className="text-4xl font-bold text-gray-800 font-serif">No olvides nada importante</h1>
          </div>
          <button onClick={() => setModalAbierto(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 active:scale-95 transition-all text-white font-semibold px-5 py-3 rounded-xl shadow-md">
            <span className="text-xl leading-none">+</span> Nueva nota
          </button>
        </div>

        {listaNotas.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-24 text-gray-300">
            <p className="text-lg font-medium">Aún no tienes notas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {listaNotas.map((nota, i) => (
              <div key={nota.id || i}
                className={`bg-white rounded-2xl border border-gray-100 border-t-4 shadow-sm p-5 flex flex-col gap-2 ${colores[i % colores.length]}`}>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-gray-800 font-semibold text-base leading-snug">{nota.titulo}</h2>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => descargarNotaPDF(nota)}
                      className={esPremium
                        ? "text-emerald-500 hover:text-emerald-600 transition-colors"
                        : "text-gray-300 hover:text-gray-400 transition-colors"}
                      title={esPremium ? "Descargar nota en PDF" : "Solo Premium"}
                    >
                      <FileDown size={17} />
                    </button>
                    <button onClick={() => abrirEditar(nota)}
                      className="text-gray-400 hover:text-violet-500 transition-colors" title="Editar">
                      <PencilSparkles size={17}  />
                    </button>
                    <button onClick={() => eliminarNota(nota.id)}
                      className="text-red-400 hover:text-red-600 transition-colors" title="Eliminar">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                {nota.descripcion && (
                  <p className="text-gray-400 text-sm leading-relaxed">{nota.descripcion}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>


      {modalAbierto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7 relative">
            <button onClick={cerrarModal} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 text-2xl leading-none">×</button>
            <h2 className="text-2xl font-bold text-gray-800 font-serif mb-6">Nueva nota</h2>
            <form onSubmit={agregarNota} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Título</label>
                <input type="text" required placeholder="Ej. Ideas para el proyecto"
                  className="w-full h-11 px-3 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  value={titulo} onChange={(e) => setTitulo(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Descripción</label>
                <textarea rows={5} placeholder="Escribe tu nota aquí..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400"
                  value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
              </div>
              <button type="submit" disabled={cargando}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 active:scale-95 transition-all text-white font-semibold py-3 rounded-xl mt-1">
                {cargando ? 'Guardando...' : 'Agregar nota'}
              </button>
            </form>
          </div>
        </div>
      )}

      {modalEditar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7 relative">
            <button onClick={cerrarEditar} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 text-2xl leading-none">×</button>
            <h2 className="text-2xl font-bold text-gray-800 font-serif mb-6">Editar nota</h2>
            <form onSubmit={guardarEdicion} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Título</label>
                <input type="text" required
                  className="w-full h-11 px-3 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  value={editTitulo} onChange={(e) => setEditTitulo(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Descripción</label>
                <textarea rows={5}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400"
                  value={editDescripcion} onChange={(e) => setEditDescripcion(e.target.value)} />
              </div>
              <button type="submit" disabled={cargando}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 active:scale-95 transition-all text-white font-semibold py-3 rounded-xl mt-1">
                {cargando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notas;