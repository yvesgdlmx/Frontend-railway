import { Link } from "react-router-dom";
const DesktopMenu = ({
  auth,
  menuVisible,
  toggleMenu,
  handleMenuItemClick,
  handleLogout,
  menuRefs,
}) => {
  return (
    <nav className="hidden md:flex gap-6 text-white font-semibold text-sm mr-16">
      {auth && auth.id && (
        <Link to="/cargar_media">
          <p className="uppercase">Avisos</p>
        </Link>
      )}
      <Link
        to="/procesos_LA"
        onClick={handleMenuItemClick}
        className="uppercase"
      >
        Producción LA
      </Link>
      <Link
        to="/"
        onClick={handleMenuItemClick}
        className="uppercase"
      >
        Producción
      </Link>
      {/* Menú Finanzas visible únicamente para administradores */}
      {auth && auth.id && auth.rol === "admin" && (
        <div className="relative" ref={menuRefs.finanzas}>
          <button
            onClick={() => toggleMenu("finanzas")}
            className="uppercase hover:text-gray-300"
          >
            Finanzas
          </button>
          {menuVisible === "finanzas" && (
            <div className="absolute left-0 mt-2 w-48 bg-black bg-opacity-50 backdrop-blur-md border border-gray-700 rounded shadow-lg">
              <ul>
                <li>
                  <Link
                    to="/finanzas_facturas"
                    onClick={handleMenuItemClick}
                    className="block px-4 py-2 uppercase hover:bg-gray-600"
                  >
                    Facturas
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
      {auth && auth.id && (
        <>
          <Link
            to="/editar_metas"
            onClick={handleMenuItemClick}
            className="uppercase hover:text-gray-300"
            ref={menuRefs.metas}
          >
            Metas
          </Link>
        </>
      )}
      <div className="relative" ref={menuRefs.tableros}>
        <button
          onClick={() => toggleMenu("tableros")}
          className="uppercase hover:text-gray-300"
        >
          Tableros
        </button>
        {menuVisible === "tableros" && (
          <div className="absolute left-0 mt-2 w-56 bg-black bg-opacity-50 backdrop-blur-md border border-gray-700 rounded shadow-lg">
            <ul>
              {[
                { to: "/tableros_tallado", label: "Tableros de Tallado" },
                { to: "/tableros_terminado", label: "Tableros de Terminado" },
                {
                  to: "/tableros_tallado_terminado",
                  label: "Tableros de Tallado y Terminado",
                },
                { to: "/surtido_detallado", label: "Surtido - Almacen" },
              ].map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.to}
                    onClick={handleMenuItemClick}
                    className="block px-4 py-2 uppercase hover:bg-gray-600"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="relative" ref={menuRefs.historial}>
        <button
          onClick={() => toggleMenu("historial")}
          className="uppercase hover:text-gray-300"
        >
          Historial
        </button>
        {menuVisible === "historial" && (
          <div className="absolute left-0 mt-2 w-56 bg-black bg-opacity-50 backdrop-blur-md border border-gray-700 rounded shadow-lg">
            <ul>
              {[
                { to: "/historial_por_dia", label: "Historial por Día" },
                { to: "/historial_por_rangos", label: "Historial por Rango de Días" },
              ].map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.to}
                    onClick={handleMenuItemClick}
                    className="block px-4 py-2 uppercase hover:bg-gray-600"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="relative" ref={menuRefs.reportes}>
        <button
          onClick={() => toggleMenu("reportes")}
          className="uppercase hover:text-gray-300"
        >
          Reportes
        </button>
        {menuVisible === "reportes" && (
          <div className="absolute left-0 mt-2 w-56 bg-black bg-opacity-50 backdrop-blur-md border border-gray-700 rounded shadow-lg">
            <ul>
              {[
                { to: "/reportes", label: "WIP DETALLADO" },
                { to: "/reportes_antiguedad", label: "ANTIGÜEDAD DE TRABAJOS" },
                { to: "/reportes_trabajos_nuevos", label: "TRABAJOS NUEVOS" },
                { to: "/reportes_wip_diario", label: "WIP DIARIO" },
                {
                  to: "/reportes_trabajos_enviados",
                  label: "TRABAJOS ENVIADOS",
                },
                {
                  to: "/reportes_resumen_trabajo",
                  label: "RESUMEN DE TRABAJOS",
                },
                {
                  to: "/reportes_ar_resumen_trabajos",
                  label: "RESUMEN AR POR ÁREA",
                },
                {
                  to: "/reportes_trabajos_sin_movimientos",
                  label: "TRABAJOS SIN MOVIMIENTOS",
                },
                {
                  to: "/reportes_de_flujo",
                  label: "REPORTE DE FLUJO",
                }
              ].map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.to}
                    onClick={handleMenuItemClick}
                    className="block px-4 py-2 uppercase hover:bg-gray-600"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {auth && auth.id ? (
        <button
          onClick={handleLogout}
          className="uppercase hover:text-gray-300"
        >
          Logout
        </button>
      ) : (
        <Link
          to="/auth"
          onClick={handleMenuItemClick}
          className="uppercase"
        >
          Login
        </Link>
      )}
    </nav>
  );
};
export default DesktopMenu;