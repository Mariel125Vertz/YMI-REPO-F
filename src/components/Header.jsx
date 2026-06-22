import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("id_usuario");
    navigate("/loging");
  };

  const navLinks = [
    { name: 'Nueva Tarea', path: '/tarea' },
    { name: 'Nueva Nota', path: '/nota' },
    { name: 'Suscripción', path: '/premium' },
  ];

  return (
    <aside className="w-64 h-screen bg-gray-900 border-r border-gray-800 flex flex-col p-6">

      <div className="mb-12 px-2">
        <h1 className="text-xl font-black text-violet-500 tracking-widest">YMI</h1>
      </div>

  
      <nav className="flex-1">
        <ul className="space-y-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isActive 
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/20' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

     
      <div className="pt-6 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-xs font-bold text-gray-500 hover:text-red-400 transition-colors duration-200 uppercase tracking-wider"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default Header;