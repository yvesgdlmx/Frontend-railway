import { Outlet, Link, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth'; // Asegúrate de ajustar la ruta según tu estructura de carpetas

const Layout = () => {
  const location = useLocation();
  const { auth, cerrarSesionAuth } = useAuth(); // Obtén el estado de autenticación

  const handelCerrarSesion = () => {
    cerrarSesionAuth()
    localStorage.removeItem('token')
  }

  return (
    <>
      <header className="header">
        <div className='header__flex'>
          <div className='header__campo-logo'>
            <Link to={"/"}>
              <img src="/img/logo_real.png" alt="Logo" width={200}/>
            </Link>
          </div>
          <div className='header__campo-titulo'>
            <p className='header__titulo'>Inteligencia de negocios</p>
          </div>
          <div className='header__campo-auth'>
            {auth && auth.id ? (
               <input type="button"  value="Cerrar Sesión" className='boton__auth' onClick={handelCerrarSesion}/>
            ) : (
              <Link to='/auth'>
                <input type="button" value="Iniciar Sesión" className='boton__auth' />
              </Link>
            )}
          </div>
          <div className='header__campo-version'>
            <p className='header__version'>Versión 2.0</p>
          </div>
        </div>
      </header>
      <aside className="sidebar">
        <div className='sidebar__contenedor'>
          <nav className='sidebar__nav'>
            <Link to='/' className={location.pathname === '/' ? 'sidebar__link sidebar__link-activo' : 'sidebar__link'}>
              <div className='sidebar__campo'>
                <img className='sidebar__logo' src="../../img/produccion.png" alt="" width={42}/>
                <p className='sidebar__texto'>Producción</p>
              </div>
            </Link>
            {auth && auth.id && ( // Condicionalmente renderiza el enlace de "Metas"
              <Link to='/metas' className={location.pathname === '/metas' ? 'sidebar__link sidebar__link-activo' : 'sidebar__link'}>
                <div className='sidebar__campo'>
                  <img className='sidebar__logo' src="../../img/meta.png" alt="" width={40}/>
                  <p className='sidebar__texto'>Metas</p>
                </div>
              </Link>
            )}
            <Link to='/tableros' className={location.pathname === '/tableros' ? 'sidebar__link sidebar__link-activo' : 'sidebar__link'}>
              <div className='sidebar__campo'>
                <img className='sidebar__logo' src="../../img/Tableros.png" alt="" width={40}/>
                <p className='sidebar__texto'>Tableros</p>
              </div>
            </Link>
            <Link to='/historial-index' className={location.pathname === '/historial-turnos' ? 'sidebar__link sidebar__link-activo' : 'sidebar__link'}>
              <div className='sidebar__campo'>
                <img className='sidebar__logo' src="../../img/history.png" alt="" width={40}/>
                <p className='sidebar__texto'>Historial</p>
              </div>
            </Link>
          </nav>
        </div>
      </aside>
      <main className="main">
        <div className="main__contenido">
          <Outlet/>
        </div>
      </main>
    </>
  );
}

export default Layout;