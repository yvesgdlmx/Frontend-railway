import React, { useState, useEffect } from "react";
import clienteAxios from "../../../config/clienteAxios";
const MediasActivas_Tableros = () => {
  const [medias, setMedias] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  // Función para obtener los medios activos del backend
  const fetchMedia = async () => {
    try {
      const response = await clienteAxios.get("/media");
      const activos = response.data.filter((item) => item.estado === true);
      setMedias(activos);
    } catch (error) {
      console.error("Error al obtener los medios activos:", error);
    }
  };
  // Hacer fetch cuando se monta el componente y cada 15 segundos (ajusta este intervalo si lo crees necesario)
  useEffect(() => {
    fetchMedia();
    const fetchInterval = setInterval(fetchMedia, 15000);
    return () => clearInterval(fetchInterval);
  }, []);
  // Este efecto se encarga de ajustar el índice actual si el array de medios se reduce
  useEffect(() => {
    if (currentMediaIndex >= medias.length) {
      setCurrentMediaIndex(0);
    }
  }, [medias, currentMediaIndex]);
  // Cambiar el índice del medio visible cada 15 segundos si hay más de uno
  useEffect(() => {
    if (medias.length > 1) {
      const sliderInterval = setInterval(() => {
        setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % medias.length);
      }, 15000);
      return () => clearInterval(sliderInterval);
    }
  }, [medias.length]);
  // Si no hay medios activos, se muestra un mensaje
  if (medias.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <p className="text-white">No hay medios activos</p>
      </div>
    );
  }
  // Selecciona solo la media actual (únicamente una se muestra a la vez)
  const currentMedia = medias[currentMediaIndex];
  return (
    <div className="relative w-full h-screen">
      {currentMedia.nombre.match(/\.(jpg|jpeg|png|gif)$/i) ? (
        <img
          src={`${backendUrl}/uploads/${currentMedia.nombre}`}
          alt={currentMedia.descripcion}
          className="w-full h-auto object-contain"
          style={{ maxWidth: "100vw" }}
        />
      ) : (
        <video autoPlay loop playsInline className="w-full h-auto object-contain" style={{ maxWidth: "100vw" }}>
          <source
            src={`${backendUrl}/uploads/${currentMedia.nombre}`}
            type="video/mp4"
          />
          Tu navegador no soporta este video.
        </video>
      )}
    </div>
  );
};
export default MediasActivas_Tableros;