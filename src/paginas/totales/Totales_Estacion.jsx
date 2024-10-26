import { useEffect, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, CogIcon } from '@heroicons/react/24/solid';
import Totales_Surtido_Estacion from "../../components/totales_estacion/Totales_Surtido_Estacion";
import Totales_Tallado_Estacion from "../../components/totales_estacion/Totales_Tallado_Estacion";
import Totales_Generado_Estacion from "../../components/totales_estacion/Totales_Generado_Estacion";
import Totales_Pulido_Estacion from "../../components/totales_estacion/Totales_Pulido_Estacion";
import Totales_Engraver_Estacion from "../../components/totales_estacion/Totales_Engraver_Estacion";
import Totales_Terminado_Estacion from "../../components/totales_estacion/Totales_Terminado_Estacion";
import Totales_Biselado_Estacion from "../../components/totales_estacion/Totales_Biselado_Estacion";
import Totales_AR_Estacion from "../../components/totales_estacion/Totales_AR_Estacion";
import Totales_Desbloqueo_Estacion from "../../components/totales_estacion/Totales_Desbloqueo_Estacion";
import Totales_Produccion_Estacion from "../../components/totales_estacion/Totales_Produccion_Estacion";

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

const SeccionMenu = ({ titulo, isOpen, toggle, children }) => (
    <div className="overflow-visible mb-4">
        <TituloSeccion 
            titulo={titulo} 
            isOpen={isOpen} 
            toggle={toggle}
        />
        <div className={`
            md:block md:max-h-full md:opacity-100
            ${isOpen ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'}
            transition-all duration-300 ease-in-out
        `}>
            {children}
        </div>
    </div>
);

const Totales_Estacion = () => {
    const [secciones, setSecciones] = useState({
        surtido: false,
        tallado: false,
        generado: false,
        pulido: false,
        engraver: false,
        ar: false,
        desbloqueo: false,
        terminado: false,
        biselado: false,
        produccion: false
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

    return (
        <div className="flex flex-col space-y-2 min-w-full mt-6 px-4 md:px-0">
            <SeccionMenu titulo="Surtido" isOpen={secciones.surtido} toggle={() => toggleSeccion('surtido')}>
                <Totales_Surtido_Estacion/>
            </SeccionMenu>
            <SeccionMenu titulo="Tallado" isOpen={secciones.tallado} toggle={() => toggleSeccion('tallado')}>
                <Totales_Tallado_Estacion/>
            </SeccionMenu>
            <SeccionMenu titulo="Generado" isOpen={secciones.generado} toggle={() => toggleSeccion('generado')}>
                <Totales_Generado_Estacion/>
            </SeccionMenu>
            <SeccionMenu titulo="Pulido" isOpen={secciones.pulido} toggle={() => toggleSeccion('pulido')}>
                <Totales_Pulido_Estacion/>
            </SeccionMenu>
            <SeccionMenu titulo="Engraver" isOpen={secciones.engraver} toggle={() => toggleSeccion('engraver')}>
                <Totales_Engraver_Estacion/>
            </SeccionMenu>
            <SeccionMenu titulo="AR" isOpen={secciones.ar} toggle={() => toggleSeccion('ar')}>
                <Totales_AR_Estacion/>
            </SeccionMenu>
            <SeccionMenu titulo="Desbloqueo" isOpen={secciones.desbloqueo} toggle={() => toggleSeccion('desbloqueo')}>
                <Totales_Desbloqueo_Estacion/>
            </SeccionMenu>
            <SeccionMenu titulo="Terminado" isOpen={secciones.terminado} toggle={() => toggleSeccion('terminado')}>
                <Totales_Terminado_Estacion/>
            </SeccionMenu>
            <SeccionMenu titulo="Biselado" isOpen={secciones.biselado} toggle={() => toggleSeccion('biselado')}>
                <Totales_Biselado_Estacion/>
            </SeccionMenu>
            <SeccionMenu titulo="Producción" isOpen={secciones.produccion} toggle={() => toggleSeccion('produccion')}>
                <Totales_Produccion_Estacion/>
            </SeccionMenu>
        </div>
    )
};

export default Totales_Estacion;