import { Outlet, Link, useLocation } from 'react-router-dom'

const AuthLayout = () => {

  const location = useLocation();

  return (
    <>
    <header className="header">
      <div className='header__flex'>
        <div className='header__campo-logo'>
          <Link to={"/"}>
            <img src="/img/logo_real.png" alt="Logo" width={200}/>
          </Link>
        </div>
        <div className='header__campo-titulo mr'>
          <p className='header__titulo'>Inteligencia de negocios</p>
        </div>
        <div className='header__campo-version'>
          <p className='header__version'>Versión 2.0</p>
        </div>
      </div>
    </header>
    <main className="main">
        <div className="main__contenido">
            <Outlet/>
        </div>
    </main>
    </>
  )
}

export default AuthLayout