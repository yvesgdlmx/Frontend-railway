import React, { useState, useEffect } from 'react';
import HeaderPantallaCompleta from "../../components/others/html_personalizado/HeaderPantallaCompleta";
import Totales_Terminado_Tableros from '../../components/tableros/Totales_Terminado_Tableros';
import Totales_Biselado_Tableros from '../../components/tableros/Totales_Biselado_Tableros';
import Totales_Biselado2_Tableros from '../../components/tableros/Totales_Biselado2_Tableros';
import Totales_Produccion_Tableros from '../../components/tableros/Totales_produccion_Tableros';
import MediasActivas_Tableros from '../../components/tableros/MediasActivas_Tableros';
const Tableros_Terminado = () => {
  // Lista de componentes a mostrar, ahora integrando MediasActivas
  const componentes = [
    'TotalesTerminado',
    'TotalesBiselado',
    'TotalesBiselado2',
    'TotalesProduccion',
    'MediasActivas'
  ];
  // Definición de las duraciones para cada componente (se asigna 40 seg a MediasActivas)
  const initialDurations = {
    TotalesTerminado: 30,
    TotalesBiselado: 30,
    TotalesBiselado2: 30,
    TotalesProduccion: 30,
    MediasActivas: 40,
  };
  // Estados para manejar la duración, el componente activo, el contador y el modo de pantalla completa
  const [durations, setDurations] = useState(initialDurations);
  const [componenteActivo, setComponenteActivo] = useState(componentes[0]);
  const [contador, setContador] = useState(initialDurations[componentes[0]]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mediasActivasDuration, setMediasActivasDuration] = useState(durations.MediasActivas);
  // Efecto para controlar el contador y el cambio de componentes de forma automática
  useEffect(() => {
    // Al cambiar el componente activo se actualiza el contador
    setContador(durations[componenteActivo]);
    const interval = setInterval(() => {
      setContador(prev => {
        if (prev <= 1) {
          // Cuando el contador llega a 1 se reinicia y se muestra el siguiente componente
          clearInterval(interval);
          const currentIndex = componentes.indexOf(componenteActivo);
          const nextIndex = (currentIndex + 1) % componentes.length;
          setComponenteActivo(componentes[nextIndex]);
          return durations[componentes[nextIndex]];
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [componenteActivo, durations]);
  // Control del cambio de estado de pantalla completa
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement !== null);
    };
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, []);
  // Función para alternar el modo pantalla completa
  const togglePantallaCompleta = () => {
    const elem = document.getElementById("componente-activo");
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
  // Funciones para cambiar manualmente entre componentes
  const cambiarComponenteAnterior = () => {
    const currentIndex = componentes.indexOf(componenteActivo);
    const newIndex = (currentIndex - 1 + componentes.length) % componentes.length;
    setComponenteActivo(componentes[newIndex]);
    setContador(durations[componentes[newIndex]]);
  };
  const cambiarComponenteSiguiente = () => {
    const currentIndex = componentes.indexOf(componenteActivo);
    const newIndex = (currentIndex + 1) % componentes.length;
    setComponenteActivo(componentes[newIndex]);
    setContador(durations[componentes[newIndex]]);
  };
  const handleDurationChange = (e) => {
    setMediasActivasDuration(e.target.value);
  };
  const actualizarDuracionMediasActivas = () => {
    const nuevaDuracion = parseInt(mediasActivasDuration, 10);
    if (!isNaN(nuevaDuracion) && nuevaDuracion > 0) {
      setDurations({
        ...durations,
        MediasActivas: nuevaDuracion
      });
      if (componenteActivo === "MediasActivas") {
        setContador(nuevaDuracion);
      }
    }
  };
  return (
    <div>
      {/* Se incorpora el Header reutilizable para la funcionalidad de pantalla completa */}
        <HeaderPantallaCompleta
          togglePantallaCompleta={togglePantallaCompleta}
          mediasActivasDuration={mediasActivasDuration}
          handleDurationChange={handleDurationChange}
          actualizarDuracionMediasActivas={actualizarDuracionMediasActivas}
        />
      {/* Se muestran controles manuales solo cuando NO se está en pantalla completa */}
      {!isFullScreen && (
        <div className="flex justify-between mb-4 px-4 mt-4">
          <button
            className="bg-gray-500 text-white font-bold uppercase p-2 rounded-md hover:bg-gray-600 transition duration-300 ease-in-out"
            onClick={cambiarComponenteAnterior}
          >
            Anterior
          </button>
          <button
            className="bg-gray-500 text-white font-bold uppercase p-2 rounded-md hover:bg-gray-600 transition duration-300 ease-in-out"
            onClick={cambiarComponenteSiguiente}
          >
            Siguiente
          </button>
        </div>
      )}
      {/* Área donde se muestra el componente activo */}
      <div
        id="componente-activo"
        style={{
          display: isFullScreen ? "flex" : "block",
          justifyContent: isFullScreen ? "center" : "initial",
          alignItems: isFullScreen ? "center" : "initial",
          height: isFullScreen ? "100vh" : "auto",
          width: isFullScreen ? "100%" : "auto",
          position: "relative",
        }}
      >
        {isFullScreen && (
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "rgba(255, 255, 255, 0.8)",
              color: "black",
              padding: "10px 15px",
              borderRadius: "10px",
              fontSize: "25px",
              fontWeight: "bold",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            Cambio en: {contador}s
          </div>
        )}
        {componenteActivo === 'TotalesTerminado' && <Totales_Terminado_Tableros />}
        {componenteActivo === 'TotalesBiselado' && <Totales_Biselado_Tableros />}
        {componenteActivo === 'TotalesBiselado2' && <Totales_Biselado2_Tableros />}
        {componenteActivo === 'TotalesProduccion' && <Totales_Produccion_Tableros />}
        {componenteActivo === 'MediasActivas' && <MediasActivas_Tableros />}
      </div>
    </div>
  );
};
export default Tableros_Terminado;