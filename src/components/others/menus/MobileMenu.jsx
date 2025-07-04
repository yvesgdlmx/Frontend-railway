import { Link } from "react-router-dom";
const MobileMenu = ({
  auth,
  isMobileMenuOpen,
  toggleMobileMenu,
  handleMenuItemClick,
  handleLogout,
}) => {
  if (!isMobileMenuOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-end transition-opacity duration-300">
      <div className="bg-black bg-opacity-70 backdrop-blur-md w-80 h-full shadow-lg overflow-y-auto transition-transform duration-300 ease-in-out">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-2xl font-semibold text-white uppercase">Menú</h2>
          <button onClick={toggleMobileMenu} className="text-gray-300 hover:text-white">
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav className="px-4 py-2">
          <ul className="space-y-2">
            {auth && auth.id && (
              <li>
                <Link
                  to="/cargar_media"
                  onClick={handleMenuItemClick}
                  className="block py-2 px-3 text-white uppercase hover:bg-gray-600"
                >
                  Avisos
                </Link>
              </li>
            )}
            <li>
              <Link
                to="/"
                onClick={handleMenuItemClick}
                className="block py-2 px-3 text-white uppercase hover:bg-gray-600"
              >
                Producción
              </Link>
            </li>
            {auth && auth.id && (
              <li>
                {/* Enlace directo para Metas */}
                <Link
                  to="/editar_metas"
                  onClick={handleMenuItemClick}
                  className="block py-2 px-3 text-white uppercase hover:bg-gray-600 font-semibold"
                >
                  Metas
                </Link>
              </li>
            )}
            <li>
              <p className="block py-2 px-3 text-white font-semibold uppercase">Tableros</p>
              <ul className="ml-4">
                {[
                  { to: "/tableros_tallado", label: "Tallado" },
                  { to: "/tableros_terminado", label: "Terminado" },
                  { to: "/tableros_tallado_terminado", label: "Tallado y Terminado" },
                ].map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.to}
                      onClick={handleMenuItemClick}
                      className="block py-2 px-3 text-white uppercase hover:bg-gray-600"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <p className="block py-2 px-3 text-white font-semibold uppercase">Historial</p>
              <ul className="ml-4">
                {[
                  { to: "/historial_por_dia", label: "Historial por Día" },
                  { to: "/historial_por_rangos", label: "Por Rango de Días" },
                ].map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.to}
                      onClick={handleMenuItemClick}
                      className="block py-2 px-3 text-white uppercase hover:bg-gray-600"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <p className="block py-2 px-3 text-white font-semibold uppercase">Reportes</p>
              <ul className="ml-4">
                {[
                  { to: "/reportes", label: "WIP DETALLADO" },
                  { to: "/reportes_antiguedad", label: "ANTIGÜEDAD DE TRABAJOS" },
                  { to: "/reportes_trabajos_nuevos", label: "TRABAJOS NUEVOS" },
                  { to: "/reportes_wip_diario", label: "WIP DIARIO" },
                  { to: "/reportes_trabajos_enviados", label: "TRABAJOS ENVIADOS" },
                  { to: "/reportes_resumen_trabajo", label: "RESUMEN DE TRABAJOS" },
                  { to: "/reportes_trabajos_sin_movimientos", label: "TRABAJOS SIN MOVIMIENTOS" },
                ].map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.to}
                      onClick={handleMenuItemClick}
                      className="block py-2 px-3 text-white uppercase hover:bg-gray-600"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
        <div className="mt-auto p-4 border-t border-gray-700">
          {auth && auth.id ? (
            <button
              onClick={handleLogout}
              className="w-full py-2 px-4 bg-red-600 text-white uppercase rounded hover:bg-red-700"
            >
              Cerrar sesión
            </button>
          ) : (
            <Link
              to="/auth"
              onClick={handleMenuItemClick}
              className="block w-full py-2 px-4 bg-blue-600 text-white text-center uppercase rounded hover:bg-blue-700"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
export default MobileMenu;