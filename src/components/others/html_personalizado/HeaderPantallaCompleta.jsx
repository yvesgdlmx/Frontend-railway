import React from "react";
import swal from "sweetalert"; // Asegúrate de que esta es la versión 1
const HeaderPantallaCompleta = ({
  togglePantallaCompleta,
  mediasActivasDuration,
  handleDurationChange,
  actualizarDuracionMediasActivas,
}) => {
  const handleActualizacion = () => {
    swal({
      title: "Actualizar duración",
      text: "¿Desea actualizar la duración de imagenes y videos?",
      icon: "warning",
      buttons: {
        cancel: "Cancelar",
        confirm: "Sí, actualizar"
      },
      dangerMode: true,
    })
    .then((willUpdate) => {
      console.log("Valor de willUpdate:", willUpdate);
      if (willUpdate) {
        actualizarDuracionMediasActivas();
        swal("¡Actualizado!", "La duración se ha actualizado.", "success");
      }
    })
    .catch(err => {
      console.error("Error en la alerta:", err);
    });
  };
  return (
    <div className="flex justify-between items-center p-4 bg-gray-200">
      <button
        className="bg-blue-500 text-white font-bold uppercase p-2 rounded-md hover:bg-blue-600 transition duration-300 ease-in-out"
        onClick={togglePantallaCompleta}
      >
        Pantalla Completa
      </button>
      <div className="flex items-center">
        <label className="mr-2 font-bold text-gray-500 uppercase">
          Duración sección de imagenes (seg):
        </label>
        <input
          type="number"
          value={mediasActivasDuration}
          onChange={handleDurationChange}
          className="border rounded-md p-2 mr-2 w-20"
          min="1"
        />
        <button
          onClick={handleActualizacion}
          className="bg-green-500 text-white font-bold uppercase p-2 rounded-md hover:bg-green-600 transition duration-300 ease-in-out"
        >
          Actualizar
        </button>
      </div>
    </div>
  );
};
export default HeaderPantallaCompleta;