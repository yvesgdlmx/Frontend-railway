import React, { useState, useEffect } from 'react';
import Totales_Terminado_Tableros from '../../components/tableros/Totales_Terminado_Tableros';
import Totales_Biselado_Tableros from '../../components/tableros/Totales_Biselado_Tableros';
import Totales_Surtido_Tableros from '../../components/tableros/Totales_Surtido_Tableros';
import Totales_Biselado2_Tableros from '../../components/tableros/Totales_Biselado2_Tableros';
import Totales_Produccion_Tableros from '../../components/tableros/Totales_produccion_Tableros';

const Tableros_Terminado = () => {
  const componentes = ['TotalesTerminado', 'TotalesBiselado', 'TotalesBiselado2', 'TotalesProduccion'];
  const [componenteActivo, setComponenteActivo] = useState(componentes[0]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [contador, setContador] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setContador(prev => {
        if (prev === 1) {
          setComponenteActivo(prevComp => {
            const currentIndex = componentes.indexOf(prevComp);
            const nextIndex = (currentIndex + 1) % componentes.length;
            return componentes[nextIndex];
          });
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement !== null);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  const togglePantallaCompleta = () => {
    const elem = document.getElementById('componente-activo');
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    }
  };

  const cambiarComponenteAnterior = () => {
    const currentIndex = componentes.indexOf(componenteActivo);
    const newIndex = (currentIndex - 1 + componentes.length) % componentes.length;
    setComponenteActivo(componentes[newIndex]);
    setContador(30); // Reinicia el contador
  };

  const cambiarComponenteSiguiente = () => {
    const currentIndex = componentes.indexOf(componenteActivo);
    const newIndex = (currentIndex + 1) % componentes.length;
    setComponenteActivo(componentes[newIndex]);
    setContador(30); // Reinicia el contador
  };

  return (
    <div>
      <button className='bg-blue-500 text-white font-bold uppercase p-2 rounded-md mb-6 hover:bg-blue-600 transition duration-300 ease-in-out ml-4' onClick={togglePantallaCompleta}>
        Pantalla Completa
      </button>
      
      {!isFullScreen && (
        <div className="flex justify-between mb-4">
          <button 
            className='bg-gray-500 text-white font-bold uppercase p-2 rounded-md hover:bg-gray-600 transition duration-300 ease-in-out ml-4'
            onClick={cambiarComponenteAnterior}
          >
            Anterior
          </button>
          <button 
            className='bg-gray-500 text-white font-bold uppercase p-2 rounded-md hover:bg-gray-600 transition duration-300 ease-in-out mr-4'
            onClick={cambiarComponenteSiguiente}
          >
            Siguiente
          </button>
        </div>
      )}

      <div
        id="componente-activo"
        style={{
          display: isFullScreen ? 'flex' : 'block',
          justifyContent: isFullScreen ? 'center' : 'initial',
          alignItems: isFullScreen ? 'center' : 'initial',
          height: isFullScreen ? '100vh' : 'auto',
          width: isFullScreen ? '100%' : 'auto',
          position: 'relative',
        }}
      >
        {isFullScreen && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.8)',
            color: 'black',
            padding: '10px 15px',
            borderRadius: '10px',
            fontSize: '25px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}>
            Cambio en: {contador}s
          </div>
        )}
        {componenteActivo === 'TotalesTerminado' && <Totales_Terminado_Tableros/>}
        {componenteActivo === 'TotalesBiselado' && <Totales_Biselado_Tableros />}
        {componenteActivo === 'TotalesBiselado2' && <Totales_Biselado2_Tableros />}
        {componenteActivo === 'TotalesProduccion' && <Totales_Produccion_Tableros />}
      </div>
    </div>
  );
};

export default Tableros_Terminado;