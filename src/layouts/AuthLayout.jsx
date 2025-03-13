import { useState, useEffect, useRef } from "react";
import { Outlet, Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import DesktopMenu from "../components/others/menus/DesktopMenu";
import MobileMenu from "../components/others/menus/MobileMenu";

const AuthLayout = () => {
  const [menuVisible, setMenuVisible] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRefs = {
    finanzas: useRef(null),
    metas: useRef(null),
    tableros: useRef(null),
    historial: useRef(null),
    reportes: useRef(null),
  };
  const { auth, cerrarSesionAuth } = useAuth();
  const toggleMenu = (menu) => {
    setMenuVisible((prev) => (prev === menu ? "" : menu));
  };
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  const handleClickOutside = (event) => {
    const clickedInside = Object.keys(menuRefs).some(
      (key) =>
        menuRefs[key].current && menuRefs[key].current.contains(event.target)
    );
    if (!clickedInside) {
      setMenuVisible("");
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleMenuItemClick = () => {
    setMenuVisible("");
    setIsMobileMenuOpen(false);
  };
  const handleLogout = () => {
    cerrarSesionAuth();
    localStorage.removeItem("token");
  };
  return (
    <div className="relative min-h-screen">
      {/* Imagen de fondo y overlay */}
      <img
        src="/img/home1.jpg"
        alt="Fondo"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black opacity-30"></div>
      {/* Header con menú superior */}
      <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-sm bg-black bg-opacity-30 p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/" onClick={handleMenuItemClick}>
            <img src="/img/logo_real.png" alt="Logo" width={170} />
          </Link>
        </div>
        <DesktopMenu
          auth={auth}
          menuVisible={menuVisible}
          toggleMenu={toggleMenu}
          handleMenuItemClick={handleMenuItemClick}
          handleLogout={handleLogout}
          menuRefs={menuRefs}
        />
        {/* Botón para menú móvil */}
        <div className="md:hidden">
          <button onClick={toggleMobileMenu}>
            <img src="/img/menu.png" alt="Menú" className="w-8 h-8" />
          </button>
        </div>
      </header>
      {/* Menú móvil */}
      <MobileMenu
        auth={auth}
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={toggleMobileMenu}
        handleMenuItemClick={handleMenuItemClick}
        handleLogout={handleLogout}
      />
      {/* Contenido principal */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-10">
        <div className="bg-slate-200 p-6 rounded-lg shadow-lg w-full max-w-lg mx-auto">
          <Outlet />
        </div>
        <p className="font-semibold text-center mt-6 text-white">
          Todos los derechos reservados Optimex SA de CV ©
        </p>
      </main>
    </div>
  );
};
export default AuthLayout;