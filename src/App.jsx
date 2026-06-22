import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Loging';
import Register from './pages/Register';
import Tareas from './pages/Tareas';
import Notas from './pages/Notas';
import Premium from './pages/Premium';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/loging" element={<Login />} />
        <Route path="/tarea" element={< Tareas/>}/>
        <Route path="/nota" element={< Notas/>}/>
        <Route path="/premium" element={< Premium/>}/>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;