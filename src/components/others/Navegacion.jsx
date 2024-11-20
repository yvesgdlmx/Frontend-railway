import { Link, useLocation } from "react-router-dom";

const Navegacion = () => {
  const location = useLocation();
  return (
    <nav className="relative right-10 mb-4">
      <ul className="grid gap-4 grid-cols-4 list-none pl-10">
        <Link to="/totales_surtido_maquina" className="text-white">
          <li className={`bg-blue-500 p-2 rounded text-center font-bold transition-colors duration-400 ${location.pathname === '/totales_surtido_maquina' ? 'bg-white text-blue-500 border border-blue-500' : 'hover:bg-white hover:text-blue-500'}`}>Surtido</li>
        </Link>
        <Link to="/totales_tallado_maquina" className="text-white">
          <li className={`bg-blue-500 p-2 rounded text-center font-bold transition-colors duration-400 ${location.pathname === '/totales_tallado_maquina' ? 'bg-white text-blue-500 border border-blue-500' : 'hover:bg-white hover:text-blue-500'}`}>Bloqueo de tallado</li>
        </Link>
        <Link to="/totales_generado_maquina" className="text-white">
          <li className={`bg-blue-500 p-2 rounded text-center font-bold transition-colors duration-400 ${location.pathname === '/totales_generado_maquina' ? 'bg-white text-blue-500 border border-blue-500' : 'hover:bg-white hover:text-blue-500'}`}>Generadores</li>
        </Link>
        <Link to="/totales_pulido_maquina" className="text-white">
          <li className={`bg-blue-500 p-2 rounded text-center font-bold transition-colors duration-400 ${location.pathname === '/totales_pulido_maquina' ? 'bg-white text-blue-500 border border-blue-500' : 'hover:bg-white hover:text-blue-500'}`}>Pulido</li>
        </Link>
        <Link to="/totales_engraver_maquina" className="text-white">
          <li className={`bg-blue-500 p-2 rounded text-center font-bold transition-colors duration-400 ${location.pathname === '/totales_engraver_maquina' ? 'bg-white text-blue-500 border border-blue-500' : 'hover:bg-white hover:text-blue-500'}`}>Engraver</li>
        </Link>
        <Link to="/totales_desblocking_maquina" className="text-white">
          <li className={`bg-blue-500 p-2 rounded text-center font-bold transition-colors duration-400 ${location.pathname === '/totales_desblocking_maquina' ? 'bg-white text-blue-500 border border-blue-500' : 'hover:bg-white hover:text-blue-500'}`}>Desbloqueo</li>
        </Link>
        <Link to="/totales_ar_maquina" className="text-white">
          <li className={`bg-blue-500 p-2 rounded text-center font-bold transition-colors duration-400 ${location.pathname === '/totales_ar_maquina' ? 'bg-white text-blue-500 border border-blue-500' : 'hover:bg-white hover:text-blue-500'}`}>AR</li>
        </Link>
        <Link to="/totales_hardcoat_maquina" className="text-white">
          <li className={`bg-blue-500 p-2 rounded text-center font-bold transition-colors duration-400 ${location.pathname === '/totales_hardcoat_maquina' ? 'bg-white text-blue-500 border border-blue-500' : 'hover:bg-white hover:text-blue-500'}`}>Hard Coat</li>
        </Link>
        <Link to="/totales_recubrimiento_maquina" className="text-white">
          <li className={`bg-blue-500 p-2 rounded text-center font-bold transition-colors duration-400 ${location.pathname === '/totales_recubrimiento_maquina' ? 'bg-white text-blue-500 border border-blue-500' : 'hover:bg-white hover:text-blue-500'}`}>Recubrimiento</li>
        </Link>
        <Link to="/totales_terminado_maquina" className="text-white">
          <li className={`bg-blue-500 p-2 rounded text-center font-bold transition-colors duration-400 ${location.pathname === '/totales_terminado_maquina' ? 'bg-white text-blue-500 border border-blue-500' : 'hover:bg-white hover:text-blue-500'}`}>Bloqueo de terminado</li>
        </Link>
        <Link to="/totales_biselado_maquina" className="text-white">
          <li className={`bg-blue-500 p-2 rounded text-center font-bold transition-colors duration-400 ${location.pathname === '/totales_biselado_maquina' ? 'bg-white text-blue-500 border border-blue-500' : 'hover:bg-white hover:text-blue-500'}`}>Biselado</li>
        </Link>
        <Link to="/totales_produccion_maquina" className="text-white">
          <li className={`bg-blue-500 p-2 rounded text-center font-bold transition-colors duration-400 ${location.pathname === '/totales_produccion_maquina' ? 'bg-white text-blue-500 border border-blue-500' : 'hover:bg-white hover:text-blue-500'}`}>Producción</li>
        </Link>
      </ul>
    </nav>
  );
};

export default Navegacion;