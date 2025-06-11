import React, { useState, useEffect } from "react";
const MediasActivas_Tableros = ({ medias }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  // Reinicia el índice si la cantidad de medios cambia o si el índice es mayor
  useEffect(() => {
    if (currentMediaIndex >= medias.length) {
      setCurrentMediaIndex(0);
    }
  }, [medias, currentMediaIndex]);
  // Si hay más de un medio, se rota cada 15 segundos
  useEffect(() => {
    if (medias.length > 1) {
      const sliderInterval = setInterval(() => {
        setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % medias.length);
      }, 15000);
      return () => clearInterval(sliderInterval);
    }
  }, [medias.length]);
  // Si no hay medios, retorna null—aunque en este caso siempre se le pasa una lista con elementos
  if (medias.length === 0) return null;
  const currentMedia = medias[currentMediaIndex];
  return (
    <div className="relative w-full h-screen">
      {currentMedia.nombre.match(/\.(jpg|jpeg|png|gif)$/i) ? (
        <img
          src={`${backendUrl}/uploads/${currentMedia.nombre}`}
          alt={currentMedia.descripcion}
          className="w-full h-full object-contain object-center"
          style={{ maxWidth: "100vw", maxHeight: "98vh" }}
        />
      ) : (
        <video
          autoPlay
          loop
          playsInline
          className="w-full h-auto object-contain"
          style={{ maxWidth: "100vw" }}
        >
          <source src={`${backendUrl}/uploads/${currentMedia.nombre}`} type="video/mp4" />
          Tu navegador no soporta este video.
        </video>
      )}
    </div>
  );
};
export default MediasActivas_Tableros;