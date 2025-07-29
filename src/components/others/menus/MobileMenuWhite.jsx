import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../../../hooks/useAuth';
const MobileMenuWhite = ({ closeMobileMenu }) => {
  const { auth, cerrarSesionAuth } = useAuth();
  const handleLogout = () => {
    cerrarSesionAuth();
    localStorage.removeItem('token');
    closeMobileMenu();
  };
  const handleClick = () => {
    closeMobileMenu();
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-end transition-opacity duration-300">
      <div className="bg-white w-80 h-full shadow-lg overflow-y-auto transform transition-transform duration-300 ease-in-out">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">Menú</h2>
          <button onClick={closeMobileMenu} className="text-gray-600 hover:text-gray-800 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <nav className="px-4 py-2">
          <ul className="space-y-2">
            {auth && auth.id && (
              <li>
                <Link
                  to={'/cargar_media'}
                  onClick={handleClick}
                  className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ml-7"
                >
                  Avisos
                </Link>
              </li>
            )}
            <li>
              <Link
                to={'/procesos_LA'}
                onClick={handleClick}
                className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ml-7"
              >
                Producción LA
              </Link>
            </li>
            <li>
              <Link
                to={'/'}
                onClick={handleClick}
                className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ml-7"
              >
                Producción
              </Link>
            </li>
            {auth && auth.id && (
              <li>
                {/* Enlace directo para "Metas" a la ruta "/editar_metas" */}
                <Link
                  to="/editar_metas"
                  onClick={handleClick}
                  className="flex items-center py-3 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors ml-3"
                >
                  Metas
                </Link>
              </li>
            )}
            <li>
              <p className="flex items-center p-3 text-gray-700 font-semibold">
                Historial
              </p>
              <ul className="ml-6 mt-2 space-y-2">
                <li>
                  <Link
                    to={'/historial_por_dia'}
                    onClick={handleClick}
                    className="block py-2 px-3 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Historial por día
                  </Link>
                </li>
                <li>
                  <Link
                    to={'/historial_por_rangos'}
                    onClick={handleClick}
                    className="block py-2 px-3 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Historial por rango de días
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <p className="flex items-center p-3 text-gray-700 font-semibold">
                Reportes
              </p>
              <ul className="ml-6 mt-2 space-y-2">
                <li>
                  <Link
                    to={'/reportes'}
                    onClick={handleClick}
                    className="block py-2 px-3 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    WIP Detallado
                  </Link>
                </li>
                <li>
                  <Link
                    to={'/reportes_antiguedad'}
                    onClick={handleClick}
                    className="block py-2 px-3 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Antigüedad de trabajos
                  </Link>
                </li>
                <li>
                  <Link
                    to={'/reportes_trabajos_nuevos'}
                    onClick={handleClick}
                    className="block py-2 px-3 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    trabajos nuevos
                  </Link>
                </li>
                <li>
                  <Link
                    to={'/reportes_wip_diario'}
                    onClick={handleClick}
                    className="block py-2 px-3 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    wip diario
                  </Link>
                </li>
                <li>
                  <Link
                    to={'/reportes_trabajos_enviados'}
                    onClick={handleClick}
                    className="block py-2 px-3 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Trabajos enviados
                  </Link>
                </li>
                <li>
                  <Link
                    to={'/reportes_resumen_trabajo'}
                    onClick={handleClick}
                    className="block py-2 px-3 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Resumen de trabajos
                  </Link>
                </li>
                <li>
                  <Link
                    to={'/reportes_trabajos_sin_movimientos'}
                    onClick={handleClick}
                    className="block py-2 px-3 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Trabajos sin movimiento
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
        <div className="mt-auto p-4 border-t border-gray-200">
          {auth && auth.id ? (
            <button
              onClick={handleLogout}
              className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Cerrar sesión
            </button>
          ) : (
            <Link
              to={'/auth'}
              onClick={handleClick}
              className="block w-full py-2 px-4 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
export default MobileMenuWhite;