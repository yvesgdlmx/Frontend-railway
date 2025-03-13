import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import DesktopMenuWhite from '../components/others/menus/DesktopMenuWhite';
import MobileMenuWhite from '../components/others/menus/MobileMenuWhite';
import useAuth from '../../hooks/useAuth';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { auth } = useAuth();
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white p-4 pr-16 flex justify-between items-center border border-b-slate-300">
        <div className="flex items-center gap-4">
          <Link to={'/'}>
            <img src="/img/logo_real.png" alt="logo" width={180} />
          </Link>
          <h1 className="font-light text-xl xs:hidden sm:hidden md:block">
            Inteligencia de negocios
          </h1>
        </div>
        <div className="xs:block sm:block md:block lg:hidden">
          <img 
            src="/img/menu.png" 
            alt="menu" 
            className="xs:w-8 sm:w-8 md:w-10 cursor-pointer"
            onClick={toggleMobileMenu}
          />
        </div>
        <DesktopMenuWhite />
      </header>
      {isMobileMenuOpen && <MobileMenuWhite closeMobileMenu={closeMobileMenu} />}
      <main className="bg-slate-100 min-h-screen min-w-full mt-24 md:p-10 flex-1 xs:p-2">
        <Outlet />
        <p className="font-semibold text-center mt-6 text-gray-700">
          Todos los derechos reservados Optimex SA de CV ©
        </p>
      </main>
    </>
  );
};
export default Layout;