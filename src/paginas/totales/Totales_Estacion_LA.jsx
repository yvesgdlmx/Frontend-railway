import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDownIcon, ChevronUpIcon, CogIcon } from '@heroicons/react/24/solid';
import Totales_Generado_EstacionLA from "../../components/totales_estacion/totales_estacion_LA/Totales_Generado_EstacionLA";
import Totales_Pulido_EstacionLA from "../../components/totales_estacion/totales_estacion_LA/Totales_Pulido_EstacionLA";
import Totales_Biselado_EstacionLA from "../../components/totales_estacion/totales_estacion_LA/Totales_Biselado_EstacionLA";

// Componente para el título desplegable
const TituloSeccion = ({ titulo, isOpen, toggle }) => (
  <div 
    className="flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100 p-4 py-6 cursor-pointer md:hidden rounded-lg shadow-sm border border-gray-200 transition-all duration-300 ease-in-out hover:shadow-md"
    onClick={toggle}
  >
    <div className="flex items-center space-x-3">
      <CogIcon className="h-6 w-6 text-blue-300" />
      <h2 className="font-semibold text-gray-600">{titulo}</h2>
    </div>
    {isOpen ? <ChevronUpIcon className="h-5 w-5 text-gray-500" /> : <ChevronDownIcon className="h-5 w-5 text-gray-500" />}
  </div>
);

const SeccionMenu = ({ id, titulo, isOpen, toggle, children }) => {
    const contentRef = useRef(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (isOpen) {
          setTimeout(() => {
            setHeight(contentRef.current.scrollHeight);
          }, 100); // Aumenta el tiempo de espera a 300ms
        } else {
          setHeight(0);
        }
      }, [isOpen]);

    return (
        <div className="overflow-hidden" id={id}>
            <TituloSeccion 
                titulo={titulo} 
                isOpen={isOpen} 
                toggle={toggle}
            />
            <div 
                ref={contentRef}
                style={{ maxHeight: isOpen ? `${height}px` : '0px' }}
                className={`
                    transition-all duration-300 ease-in-out
                    ${isOpen ? 'opacity-100' : 'opacity-0'}
                    md:block md:opacity-100 md:max-h-none md:overflow-visible
                `}
            >
                {children}
            </div>
        </div>
    );
};

const Totales_Estacion_LA = () => {
    const location = useLocation();
    const [secciones, setSecciones] = useState({
        generado: false,
    });

    const toggleSeccion = (seccion) => {
        setSecciones(prev => ({ ...prev, [seccion]: !prev[seccion] }));
    };

    useEffect(() => {
        const interval = setInterval(() => {
          window.location.reload();
        }, 300000); // Actualiza cada 5 minutos
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const seccionAAbrir = params.get('seccion');
        if (seccionAAbrir) {
          setSecciones(prev => ({ ...prev, [seccionAAbrir]: true }));
          setTimeout(() => {
            const element = document.getElementById(seccionAAbrir);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        }
      }, [location]);

    return (
        <div className="flex flex-col space-y-2 min-w-full mt-6 px-4 md:px-0">
            <div className="md:hidden">
                {/* Secciones desplegables para móviles */}
                <SeccionMenu id='generado' titulo="Generado" isOpen={secciones.generado} toggle={() => toggleSeccion('generado')}>
                    <Totales_Generado_EstacionLA/>
                </SeccionMenu>
                <SeccionMenu id='pulido' titulo="Pulido" isOpen={secciones.pulido} toggle={() => toggleSeccion('pulido')}>
                    <Totales_Pulido_EstacionLA/>
                </SeccionMenu>
                <SeccionMenu id='biselado' titulo="Biselado" isOpen={secciones.biselado} toggle={() => toggleSeccion('biselado')}>
                    <Totales_Biselado_EstacionLA/>
                </SeccionMenu>
            </div>
            <div className="hidden md:block">
                {/* Secciones siempre visibles para pantallas grandes */}
                <Totales_Generado_EstacionLA/>
                <Totales_Pulido_EstacionLA/>
                <Totales_Biselado_EstacionLA/>
            </div>
        </div>
    )
};

export default Totales_Estacion_LA;