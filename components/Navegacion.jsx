import { Link, useLocation } from "react-router-dom";

const Navegacion = () => {
  const location = useLocation();

  return (
    <nav className="menu-navegacion">
      <ul className="menu-navegacion__ul">
        <Link to="/lenslog-horas" className="menu-navegacion__link">
          <li className={`menu-navegacion__li ${location.pathname === '/lenslog-horas' ? 'active' : ''}`}>Surtido</li>
        </Link>
        <Link to="/tallados-horas" className="menu-navegacion__link">
          <li className={`menu-navegacion__li ${location.pathname === '/tallados-horas' ? 'active' : ''}`}>Bloqueo de tallado</li>
        </Link>
        <Link to="/generadores-horas" className="menu-navegacion__link">
          <li className={`menu-navegacion__li ${location.pathname === '/generadores-horas' ? 'active' : ''}`}>Generadores</li>
        </Link>
        <Link to="/pulidoras-horas" className="menu-navegacion__link">
          <li className={`menu-navegacion__li ${location.pathname === '/pulidoras-horas' ? 'active' : ''}`}>Pulido</li>
        </Link>
        <Link to="/engravers-horas" className="menu-navegacion__link">
          <li className={`menu-navegacion__li ${location.pathname === '/engravers-horas' ? 'active' : ''}`}>Engraver</li>
        </Link>
        <Link to="/desblocking-horas" className="menu-navegacion__link">
          <li className={`menu-navegacion__li ${location.pathname === '/desblocking-horas' ? 'active' : ''}`}>Desbloqueo</li>
        </Link>
        <Link to="/ar-horas" className="menu-navegacion__link">
          <li className={`menu-navegacion__li ${location.pathname === '/ar-horas' ? 'active' : ''}`}>AR</li>
        </Link>
        <Link to="/terminados-horas" className="menu-navegacion__link">
          <li className={`menu-navegacion__li ${location.pathname === '/terminados-horas' ? 'active' : ''}`}>Bloqueo de terminado</li>
        </Link>
        <Link to="/biselados-horas" className="menu-navegacion__link">
          <li className={`menu-navegacion__li ${location.pathname === '/biselados-horas' ? 'active' : ''}`}>Biselado</li>
        </Link>
        <Link to="/jobcomplete-horas" className="menu-navegacion__link">
          <li className={`menu-navegacion__li ${location.pathname === '/jobcomplete-horas' ? 'active' : ''}`}>Producción</li>
        </Link>
      </ul>
    </nav>
  );
};

export default Navegacion;