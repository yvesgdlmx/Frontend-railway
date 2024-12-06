import { useState, useEffect, useRef } from 'react';
import { Outlet, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth'; // Asegúrate de que la ruta sea correcta

const Layout = () => {
    const [menuVisible, setMenuVisible] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const menuRefs = {
        metas: useRef(null),
        tableros: useRef(null),
        historial: useRef(null),
        reportes: useRef(null)
    };
    const { auth, cerrarSesionAuth } = useAuth(); // Obtener el estado de autenticación

    const toggleMenu = (menu) => {
        setMenuVisible(prevMenu => (prevMenu === menu ? '' : menu));
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleClickOutside = (event) => {
        const isClickInsideAnyMenu = Object.keys(menuRefs).some(
            menu => menuRefs[menu].current && menuRefs[menu].current.contains(event.target)
        );
        if (!isClickInsideAnyMenu) {
            setMenuVisible('');
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMenuItemClick = () => {
        setMenuVisible('');
        setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        cerrarSesionAuth();
        localStorage.removeItem('token');
    };

    return (
        <>
            <header className="fixed top-0 left-0 w-full z-50 bg-white p-4 pt-4 pr-16 flex justify-between items-center border border-b-slate-300">
                <div className="flex items-center gap-4">
                    <Link to={'/'}>
                        <img src="/img/logo_real.png" alt="" width={180} />
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
                <nav className="hidden lg:block">
                    <div className="flex gap-8 font-semibold uppercase text-sm text-gray-500">
                        <Link to={'/'}>
                            <p>Producción</p>
                        </Link>
                        {auth && auth.id && ( // Mostrar solo si está autenticado
                            <div className="relative" ref={menuRefs.metas}>
                                <button onClick={() => toggleMenu('metas')} className="hover:text-gray-900 focus:outline-none uppercase">
                                    Metas
                                </button>
                                {menuVisible === 'metas' && (
                                    <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg">
                                        <ul className="py-1 text-slate-700">
                                            <li>
                                                <Link to={'/surtido_metas'} onClick={handleMenuItemClick}>
                                                    <p className="block px-4 py-2 hover:bg-gray-100">Manuales</p>
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to={'/tallado_metas'} onClick={handleMenuItemClick}>
                                                    <p className="block px-4 py-2 hover:bg-gray-100">Bloqueo de tallado</p>
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to={'/generado_metas'} onClick={handleMenuItemClick}>
                                                    <p className="block px-4 py-2 hover:bg-gray-100">Generadores</p>
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to={'/pulido_metas'} onClick={handleMenuItemClick}>
                                                    <p className="block px-4 py-2 hover:bg-gray-100">Pulido</p>
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to={'/engraver_metas'} onClick={handleMenuItemClick}>
                                                    <p className="block px-4 py-2 hover:bg-gray-100">Engraver</p>
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to={'/terminado_metas'} onClick={handleMenuItemClick}>
                                                    <p className="block px-4 py-2 hover:bg-gray-100">Bloqueo de terminado</p>
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to={'/biselado_metas'} onClick={handleMenuItemClick}>
                                                    <p className="block px-4 py-2 hover:bg-gray-100">Biselado</p>
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="relative" ref={menuRefs.tableros}>
                            <button onClick={() => toggleMenu('tableros')} className="hover:text-gray-900 focus:outline-none uppercase">
                                Tableros
                            </button>
                            {menuVisible === 'tableros' && (
                                <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg">
                                    <ul className="py-1 text-slate-700">
                                        <li>
                                            <Link to={'/tableros_tallado'} onClick={handleMenuItemClick}>
                                                <p className="block px-4 py-2 hover:bg-gray-100">Tableros de tallado</p>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={'/tableros_terminado'} onClick={handleMenuItemClick}>
                                                <p className="block px-4 py-2 hover:bg-gray-100">Tableros de terminado</p>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={'/tableros_tallado_terminado'} onClick={handleMenuItemClick}>
                                                <p className="block px-4 py-2 hover:bg-gray-100">Tableros tallado y terminado</p>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="relative" ref={menuRefs.historial}>
                            <button onClick={() => toggleMenu('historial')} className="hover:text-gray-900 focus:outline-none uppercase">
                                Historial
                            </button>
                            {menuVisible === 'historial' && (
                                <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg">
                                    <ul className="py-1 text-slate-700">
                                        <li>
                                            <Link to={'/historial_por_dia'} onClick={handleMenuItemClick}>
                                                <p className="block px-4 py-2 hover:bg-gray-100">Historial por día</p>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={'/historial_por_rangos'} onClick={handleMenuItemClick}>
                                                <p className="block px-4 py-2 hover:bg-gray-100">Historial por rango de días</p>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="relative" ref={menuRefs.reportes}>
                            <button 
                                onClick={() => toggleMenu('reportes')} 
                                className="hover:text-gray-900 focus:outline-none uppercase"
                            >
                                Reportes
                            </button>
                            {menuVisible === 'reportes' && (
                                <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg">
                                    <ul className="py-1 text-slate-700">
                                        <li>
                                            <Link to={'/reportes'} onClick={handleMenuItemClick}>
                                                <p className="block px-4 py-2 hover:bg-gray-100">WIP Detallado</p>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={'/reportes_trabajos_nuevos'} onClick={handleMenuItemClick}>
                                                <p className="block px-4 py-2 hover:bg-gray-100">Reporte de trabajos nuevos</p>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={'/reportes_antiguedad'} onClick={handleMenuItemClick}>
                                                <p className="block px-4 py-2 hover:bg-gray-100">Reporte de antiguedades</p>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                        {auth && auth.id ? (
                            <button onClick={handleLogout} className="hover:text-gray-900 focus:outline-none uppercase">
                                Logout
                            </button>
                        ) : (
                            <Link to={'/auth'}>
                                <p>Login</p>
                            </Link>
                        )}
                    </div>
                </nav>
            </header>
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-end transition-opacity duration-300">
                    <div className="bg-white w-80 h-full shadow-lg overflow-y-auto transform transition-transform duration-300 ease-in-out">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-2xl font-semibold text-gray-800">Menú</h2>
                            <button onClick={toggleMobileMenu} className="text-gray-600 hover:text-gray-800 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <nav className="px-4 py-2">
                            <ul className="space-y-2">
                                <li>
                                    <Link to={'/'} onClick={handleMenuItemClick} className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                                        </svg>
                                        Producción
                                    </Link>
                                </li>
                                {auth && auth.id && (
                                    <li>
                                        <p className="flex items-center p-3 text-gray-700 font-semibold">
                                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                                            </svg>
                                            Metas
                                        </p>
                                        <ul className="ml-6 mt-2 space-y-2">
                                            {['Manuales', 'Bloqueo de tallado', 'Generadores', 'Pulido', 'Engraver', 'Bloqueo de terminado', 'Biselado'].map((item, index) => (
                                                <li key={index}>
                                                    <Link to={`/${item.toLowerCase().replace(/ /g, '_')}_metas`} onClick={handleMenuItemClick} className="block py-2 px-3 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                                                        {item}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                )}
                                <li>
                                    <p className="flex items-center p-3 text-gray-700 font-semibold">
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        Historial
                                    </p>
                                    <ul className="ml-6 mt-2 space-y-2">
                                        <li>
                                            <Link to={'/historial_por_dia'} onClick={handleMenuItemClick} className="block py-2 px-3 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                                                Historial por día
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={'/historial_por_rangos'} onClick={handleMenuItemClick} className="block py-2 px-3 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                                                Historial por rango de días
                                            </Link>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <p className="flex items-center p-3 text-gray-700 font-semibold">
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                        Reportes
                                    </p>
                                    <ul className="ml-6 mt-2 space-y-2">
                                        <li>
                                            <Link 
                                                to={'/reportes'} 
                                                onClick={handleMenuItemClick} 
                                                className="block py-2 px-3 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                WIP Detallado
                                            </Link>
                                        </li>
                                        <li>
                                            <Link 
                                                to={'/reportes_trabajos_nuevos'} 
                                                onClick={handleMenuItemClick} 
                                                className="block py-2 px-3 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                Reporte de trabajos nuevos
                                            </Link>
                                        </li>
                                        <li>
                                            <Link 
                                                to={'/reportes_antiguedad'} 
                                                onClick={handleMenuItemClick} 
                                                className="block py-2 px-3 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                Reporte de antiguedades
                                            </Link>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </nav>
                        <div className="mt-auto p-4 border-t border-gray-200">
                            {auth && auth.id ? (
                                <button onClick={handleLogout} className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                    Cerrar sesión
                                </button>
                            ) : (
                                <Link to={'/auth'} onClick={handleMenuItemClick} className="block w-full py-2 px-4 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors">
                                    Iniciar sesión
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <main className="bg-slate-100 min-h-screen min-w-full mt-24 md:p-10 flex-1 xs:p-2 main">
                <Outlet />
                <p className="font-semibold text-center mt-6 text-gray-700">
                    Todos los derechos reservados Optimex SA de CV ©
                </p>
            </main>
        </>
    );
};

export default Layout;