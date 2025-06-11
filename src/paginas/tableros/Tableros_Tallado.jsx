import React, { useState, useEffect } from "react";
import clienteAxios from "../../../config/clienteAxios";
import Totales_Generado_Tableros from '../../components/tableros/Totales_Generado_Tableros';
import Totales_Pulido_Tableros from '../../components/tableros/Totales_Pulido_Tableros';
import Totales_Tallado_Tableros from '../../components/tableros/Totales_Tallado_Tableros';
import Totales_Engraver_Tableros from '../../components/tableros/Totales_Engraver_Tableros';
import Totales_Surtido_Tableros from '../../components/tableros/Totales_Surtido_Tableros';
import Totales_Produccion_Tableros from "../../components/tableros/Totales_Produccion_Tableros";
import MediasActivas_Tableros from '../../components/tableros/MediasActivas_Tableros';
import HeaderPantallaCompleta from "../../components/others/html_personalizado/HeaderPantallaCompleta";
const Tableros_Tallado = () => {
  const componentes = [
    'TotalesSurtido',
    'TotalesTallado',
    'TotalesGenerado',
    'TotalesPulido',
    'TotalesEngraver',
    'TotalesProduccion',
    'MediasActivas'
  ];
  const initialDurations = {
    TotalesSurtido: 30,
    TotalesTallado: 30,
    TotalesGenerado: 30,
    TotalesPulido: 30,
    TotalesEngraver: 30,
    TotalesProduccion: 30,
    MediasActivas: 40
  };
  const [durations, setDurations] = useState(initialDurations);
  const [componenteActivo, setComponenteActivo] = useState(componentes[0]);
  const [contador, setContador] = useState(durations[componenteActivo]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mediasActivasDuration, setMediasActivasDuration] = useState(durations.MediasActivas);
  // Estado para almacenar los medios activos (levantado en el padre)
  const [mediasActivas, setMediasActivas] = useState([]);
  // Función para obtener la lista de medios activos
  const fetchMediasActivas = async () => {
    try {
      const response = await clienteAxios.get("/media");
      const activos = response.data.filter(item => item.estado === true);
      setMediasActivas(activos);
    } catch (error) {
      console.error("Error al obtener los medios activos:", error);
    }
  };
  // Realiza el fetch inicial y luego cada 15 segundos
  useEffect(() => {
    fetchMediasActivas();
    const interval = setInterval(fetchMediasActivas, 15000);
    return () => clearInterval(interval);
  }, []);
  // Cada vez que cambia el componente activo, actualizamos el contador
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
  // Si el componente activo es MediasActivas y no hay medios, se cambia automáticamente al siguiente componente
  useEffect(() => {
    if (componenteActivo === "MediasActivas" && mediasActivas.length === 0) {
      // Cambia al siguiente componente para evitar que se muestre un contenedor vacío y se salga del full screen.
      cambiarComponenteSiguiente();
    }
  }, [componenteActivo, mediasActivas]);
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
      {/* Header */}
      <HeaderPantallaCompleta
        togglePantallaCompleta={togglePantallaCompleta}
        mediasActivasDuration={mediasActivasDuration}
        handleDurationChange={handleDurationChange}
        actualizarDuracionMediasActivas={actualizarDuracionMediasActivas}
      />
      {/* Botones de navegación */}
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
      {/* El contenedor que se pone en full screen se renderiza siempre.
          Dentro de él se muestra el componente correspondiente. En el caso de "MediasActivas",
          si no hay medios, se muestra un placeholder vacío para mantener el contenedor y evitar salir del FS. */}
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
        {componenteActivo === "TotalesSurtido" && <Totales_Surtido_Tableros />}
        {componenteActivo === "TotalesTallado" && <Totales_Tallado_Tableros />}
        {componenteActivo === "TotalesGenerado" && <Totales_Generado_Tableros />}
        {componenteActivo === "TotalesPulido" && <Totales_Pulido_Tableros />}
        {componenteActivo === "TotalesEngraver" && <Totales_Engraver_Tableros />}
        {componenteActivo === "TotalesProduccion" && <Totales_Produccion_Tableros />}
        {componenteActivo === "MediasActivas" &&
          (mediasActivas.length > 0 ? (
            <MediasActivas_Tableros medias={mediasActivas} />
          ) : (
            // Si no hay medios, se muestra un div vacío (placeholder) para no destruir el contenedor full screen
            <div style={{ width: "100%", height: "100%" }} />
          ))
        }
      </div>
    </div>
  );
};
export default Tableros_Tallado;