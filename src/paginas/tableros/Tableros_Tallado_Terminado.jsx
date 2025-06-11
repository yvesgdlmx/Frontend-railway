import React, { useState, useEffect } from 'react';
import clienteAxios from '../../../config/clienteAxios';
import Totales_Surtido_Tableros from '../../components/tableros/Totales_Surtido_Tableros';
import Totales_Tallado_Tableros from '../../components/tableros/Totales_Tallado_Tableros';
import Totales_Generado_Tableros from '../../components/tableros/Totales_Generado_Tableros';
import Totales_Pulido_Tableros from '../../components/tableros/Totales_Pulido_Tableros';
import Totales_Engraver_Tableros from '../../components/tableros/Totales_Engraver_Tableros';
import Totales_Terminado_Tableros from '../../components/tableros/Totales_Terminado_Tableros';
import Totales_Biselado_Tableros from '../../components/tableros/Totales_Biselado_Tableros';
import Totales_Biselado2_Tableros from '../../components/tableros/Totales_Biselado2_Tableros';
import Totales_Produccion_Tableros from '../../components/tableros/Totales_produccion_Tableros';
import Totales_Produccion_Tableros from '../../components/tableros/Totales_produccion_Tableros';
import HeaderPantallaCompleta from '../../components/others/html_personalizado/HeaderPantallaCompleta';
import MediasActivas_Tableros from '../../components/tableros/MediasActivas_Tableros';
const Tableros_Tallado_Terminado = () => {
  // Lista de componentes a mostrar
  const componentes = [
    "TotalesSurtido",
    "TotalesTallado",
    "TotalesGenerado",
    "TotalesPulido",
    "TotalesEngraver",
    "TotalesTerminado", 
    "TotalesBiselado", 
    "TotalesBiselado2",
    "TotalesProduccion",
    "MediasActivas"
  ];
  
  // Duraciones para cada componente
  const initialDurations = {
    TotalesSurtido: 30,
    TotalesTallado: 30,
    TotalesGenerado: 30,
    TotalesPulido: 30,
    TotalesEngraver: 30,
    TotalesTerminado: 30,
    TotalesBiselado: 30,
    TotalesBiselado2: 30,
    TotalesProduccion: 30,
    MediasActivas: 40
  };
  const [durations, setDurations] = useState(initialDurations);
  const [componenteActivo, setComponenteActivo] = useState(componentes[0]);
  const [contador, setContador] = useState(durations[componenteActivo]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mediasActivasDuration, setMediasActivasDuration] = useState(durations.MediasActivas);
  // Estado para almacenar las medias activas levantadas desde el backend
  const [mediasActivas, setMediasActivas] = useState([]);
  // Función para obtener la lista de medios activos
  const fetchMediasActivas = async () => {
    try {
      const response = await clienteAxios.get("/media");
      const activos = response.data.filter((item) => item.estado === true);
      setMediasActivas(activos);
    } catch (error) {
      console.error("Error obteniendo medias activas:", error);
    }
  };
  // Fetch inicial y cada 15 segundos para actualizar las medias activas
  useEffect(() => {
    fetchMediasActivas();
    const interval = setInterval(fetchMediasActivas, 15000);
    return () => clearInterval(interval);
  }, []);
  // Efecto para la cuenta regresiva y cambio automático de componente
  useEffect(() => {
    setContador(durations[componenteActivo]);
    const interval = setInterval(() => {
      setContador(prev => {
        if (prev <= 1) {
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
  // Si el componente activo es "MediasActivas" y no hay medios activos, se cambia automáticamente al siguiente
  useEffect(() => {
    if (componenteActivo === "MediasActivas" && mediasActivas.length === 0) {
      // Cambio automático para evitar que se muestre espacio vacío:
      cambiarComponenteSiguiente();
    }
  }, [componenteActivo, mediasActivas]);
  // Manejamos el cambio en el modo full screen
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement !== null);
    };
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, []);
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
      setDurations({ ...durations, MediasActivas: nuevaDuracion });
      if (componenteActivo === "MediasActivas") {
        setContador(nuevaDuracion);
      }
    }
  };
  return (
    <div>
      {/* Header con controles para pantalla completa */}
      <HeaderPantallaCompleta
        togglePantallaCompleta={togglePantallaCompleta}
        mediasActivasDuration={mediasActivasDuration}
        handleDurationChange={handleDurationChange}
        actualizarDuracionMediasActivas={actualizarDuracionMediasActivas}
      />
      {/* Controles de navegación */}
      <div className="flex justify-between p-4">
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
      {/* Contenedor que siempre se mantiene para preservar el full screen */}
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
        {isFullScreen && componenteActivo !== "MediasActivas" && (
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              fontSize: "25px",
              fontWeight: "bold",
              color: "#FFF",
            }}
          >
            Cambio en: {contador}s
          </div>
        )}
        {componenteActivo === 'TotalesSurtido' && <Totales_Surtido_Tableros />}
        {componenteActivo === 'TotalesTallado' && <Totales_Tallado_Tableros />}
        {componenteActivo === 'TotalesGenerado' && <Totales_Generado_Tableros />}
        {componenteActivo === 'TotalesPulido' && <Totales_Pulido_Tableros />}
        {componenteActivo === 'TotalesEngraver' && <Totales_Engraver_Tableros />}
        {componenteActivo === 'TotalesTerminado' && <Totales_Terminado_Tableros />}
        {componenteActivo === 'TotalesBiselado' && <Totales_Biselado_Tableros />}
        {componenteActivo === 'TotalesBiselado2' && <Totales_Biselado2_Tableros />}
        {componenteActivo === 'TotalesProduccion' && <Totales_Produccion_Tableros />}
        {componenteActivo === 'MediasActivas' &&
          (mediasActivas.length > 0 ? (
            <MediasActivas_Tableros medias={mediasActivas} />
          ) : (
            // En caso de que no haya medias, se muestra un fragmento vacío,
            // pero el useEffect cambiará el componente automáticamente
            <></>
          ))
        }
      </div>
    </div>
  );
};
export default Tableros_Tallado_Terminado;