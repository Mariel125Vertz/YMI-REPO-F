import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import { PencilSparkles, Trash2, FileDown } from "lucide-react";

const prioridadConfig = {
  baja: { bg: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400', label: 'Baja' },
  media: { bg: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400', label: 'Media' },
  urgente: { bg: 'bg-red-100 text-red-700', dot: 'bg-red-400', label: 'Urgente' },
};

const Tareas = () => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [tareaEditando, setTareaEditando] = useState(null);
  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [editNombre, setEditNombre] = useState("");
  const [editFecha, setEditFecha] = useState("");
  const [editPrioridad, setEditPrioridad] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [listaTareas, setListaTareas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [esPremium, setEsPremium] = useState(false);

  const navigate = useNavigate();
  const id_usuario = localStorage.getItem('id_usuario');

  useEffect(() => {
    if (!id_usuario) { navigate('/loging'); return; }

    
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
        .catch(() => { });
    }

    const obtenerTareas = async () => {
      try {
        const respuesta = await fetch(`http://localhost:8000/tareas/${id_usuario}`);
        const data = await respuesta.json();
        if (respuesta.ok) {
          setListaTareas(data.map(t => ({
            id: t.id_tarea,
            nombre: t.nombre,
            descripcion: t.descripcion,
            prioridad: t.prioridad,
            fecha: t.fecha_entrega
          })));
        }
      } catch (err) { console.error(err); }
    };
    obtenerTareas();
  }, [id_usuario, navigate]);

  const cerrarModal = () => {
    setModalAbierto(false);
    setNombre(""); setFecha(""); setPrioridad(""); setDescripcion("");
  };

  const abrirEditar = (tarea) => {
    setTareaEditando(tarea);
    setEditNombre(tarea.nombre);
    setEditFecha(tarea.fecha || "");
    setEditPrioridad(tarea.prioridad || "");
    setEditDescripcion(tarea.descripcion || "");
    setModalEditar(true);
  };

  const cerrarEditar = () => {
    setModalEditar(false);
    setTareaEditando(null);
  };

  const agregarTarea = async (e) => {
    e.preventDefault();
    if (!id_usuario) return;
    setCargando(true);
    try {
      const respuesta = await fetch(`http://localhost:8000/agregar-tarea/${id_usuario}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, fecha_entrega: fecha, prioridad, descripcion })
      });
      const data = await respuesta.json();
      setCargando(false);
      if (data.mensaje === 'Tarea agregada exitosamente') {
        setListaTareas(prev => [...prev, { id: data.id, nombre, fecha, prioridad, descripcion }]);
        cerrarModal();
      } else { alert(data.mensaje); }
    } catch { setCargando(false); alert("Error de conexión"); }
  };

  const eliminarTarea = async (id_tarea) => {
    if (!window.confirm("¿Eliminar esta tarea?")) return;
    try {
      const respuesta = await fetch(`http://localhost:8000/eliminar-tarea/${id_usuario}/${id_tarea}`, {
        method: 'DELETE'
      });
      const data = await respuesta.json();
      if (respuesta.ok) {
        setListaTareas(prev => prev.filter(t => Number(t.id) !== Number(id_tarea)));
      } else { alert(data.mensaje); }
    } catch { alert("Error de conexión"); }
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();
    if (!tareaEditando) return;
    setCargando(true);
    try {
      const respuesta = await fetch(`http://localhost:8000/editar-tarea/${id_usuario}/${tareaEditando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: editNombre,
          fecha_entrega: editFecha,
          prioridad: editPrioridad,
          descripcion: editDescripcion
        })
      });
      const data = await respuesta.json();
      setCargando(false);
      if (respuesta.ok) {
        setListaTareas(prev => prev.map(t =>
          Number(t.id) === Number(tareaEditando.id)
            ? { ...t, nombre: editNombre, fecha: editFecha, prioridad: editPrioridad, descripcion: editDescripcion }
            : t
        ));
        cerrarEditar();
      } else { alert(data.mensaje); }
    } catch { setCargando(false); alert("Error de conexión"); }
  };


  const descargarTareaPDF = (tarea) => {
    if (!esPremium) {
      navigate('/premium');
      return;
    }

    const prio = prioridadConfig[tarea.prioridad]?.label || 'Sin prioridad';
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text("Tarea – YMI", 14, y);
    y += 12;

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Nombre: ${tarea.nombre}`, 14, y);
    y += 8;

    doc.setFont(undefined, 'normal');
    doc.text(`Prioridad: ${prio}`, 14, y);
    y += 8;
    doc.text(`Fecha: ${tarea.fecha || 'Sin fecha'}`, 14, y);
    y += 8;

    const descLines = doc.splitTextToSize(`Descripción: ${tarea.descripcion || 'Sin descripción'}`, 180);
    doc.text(descLines, 14, y);

    doc.save(`tarea-${tarea.nombre.replace(/\s+/g, '_').toLowerCase()}.pdf`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Header />

      <div className="flex-1 p-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs text-violet-500 font-semibold uppercase tracking-widest mb-1">Mis tareas</p>
            <h1 className="text-4xl font-bold text-gray-800 font-serif">No olvides nada importante</h1>
          </div>
          <button onClick={() => setModalAbierto(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 active:scale-95 transition-all text-white font-semibold px-5 py-3 rounded-xl shadow-md">
            <span className="text-xl leading-none">+</span> Nueva tarea
          </button>
        </div>

        {listaTareas.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-24 text-gray-300">
            <p className="text-lg font-medium">Aún no tienes tareas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {listaTareas.map((tarea) => (
              <div key={tarea.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-gray-800 font-semibold text-base leading-snug">{tarea.nombre}</h2>
                  <div className="flex items-center gap-2 shrink-0">
                    {tarea.prioridad && (
                      <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${prioridadConfig[tarea.prioridad]?.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${prioridadConfig[tarea.prioridad]?.dot}`} />
                        {prioridadConfig[tarea.prioridad]?.label}
                      </span>
                    )}
                    <button
                      onClick={() => descargarTareaPDF(tarea)}
                      className={esPremium
                        ? "text-emerald-500 hover:text-emerald-600 transition-colors"
                        : "text-gray-300 hover:text-gray-400 transition-colors"}
                      title={esPremium ? "Descargar tarea en PDF" : "Solo Premium"}
                    >
                      <FileDown size={18} />
                    </button>
                    <button onClick={() => abrirEditar(tarea)} className="text-gray-400 hover:text-violet-500 transition-colors" title="Editar tarea">
                      <PencilSparkles size={18} />
                    </button>
                    <button onClick={() => eliminarTarea(tarea.id)} className="text-red-400 hover:text-red-600 transition-colors" title="Eliminar tarea">
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
                {tarea.descripcion && <p className="text-gray-400 text-sm leading-relaxed">{tarea.descripcion}</p>}
                {tarea.fecha && (
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-auto pt-2 border-t border-gray-50">
                    <span>{tarea.fecha}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal nueva tarea */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7 relative">
            <button onClick={cerrarModal} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 text-2xl leading-none">×</button>
            <h2 className="text-2xl font-bold text-gray-800 font-serif mb-6">Nueva tarea</h2>
            <form onSubmit={agregarTarea} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Nombre</label>
                <input type="text" required placeholder="Ej. Entregar proyecto final"
                  className="w-full h-11 px-3 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Fecha de entrega</label>
                <input type="date"
                  className="w-full h-11 px-3 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  value={fecha} onChange={(e) => setFecha(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Prioridad</label>
                <div className="flex gap-2">
                  {['baja', 'media', 'urgente'].map((p) => (
                    <button type="button" key={p} onClick={() => setPrioridad(p)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all
                        ${prioridad === p ? prioridadConfig[p].bg + ' border-transparent' : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${prioridadConfig[p].dot}`} />
                      {prioridadConfig[p].label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Descripción</label>
                <textarea rows={3} placeholder="Añade detalles..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400"
                  value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
              </div>
              <button type="submit" disabled={cargando}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 active:scale-95 transition-all text-white font-semibold py-3 rounded-xl mt-1">
                {cargando ? 'Guardando...' : 'Agregar tarea'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal editar tarea */}
      {modalEditar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7 relative">
            <button onClick={cerrarEditar} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 text-2xl leading-none">×</button>
            <h2 className="text-2xl font-bold text-gray-800 font-serif mb-6">Editar tarea</h2>
            <form onSubmit={guardarEdicion} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Nombre</label>
                <input type="text" required
                  className="w-full h-11 px-3 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  value={editNombre} onChange={(e) => setEditNombre(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Fecha de entrega</label>
                <input type="date"
                  className="w-full h-11 px-3 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  value={editFecha} onChange={(e) => setEditFecha(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Prioridad</label>
                <div className="flex gap-2">
                  {['baja', 'media', 'urgente'].map((p) => (
                    <button type="button" key={p} onClick={() => setEditPrioridad(p)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all
                        ${editPrioridad === p ? prioridadConfig[p].bg + ' border-transparent' : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${prioridadConfig[p].dot}`} />
                      {prioridadConfig[p].label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Descripción</label>
                <textarea rows={3}
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

export default Tareas;