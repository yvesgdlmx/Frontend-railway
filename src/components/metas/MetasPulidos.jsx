import React, { useState, useEffect } from "react";
import clienteAxios from "../../../config/clienteAxios";
import { FaSave } from "react-icons/fa";
import TablaMetas from "../others/tables/TablaMetas";
import swal from "sweetalert";
const MetasPulidos = () => {
  const [metas, setMetas] = useState([]);
  useEffect(() => {
    const obtenerMetas = async () => {
      try {
        const respuesta = await clienteAxios.get("/metas/metas-pulidos");
        setMetas(respuesta.data.registros);
      } catch (error) {
        console.error("Error al obtener las metas de pulidos:", error);
      }
    };
    obtenerMetas();
  }, []);
  const handleInputChange = (e, id, campo) => {
    const { value } = e.target;
    setMetas((prevMetas) =>
      prevMetas.map((meta) =>
        meta.id === id ? { ...meta, [campo]: value } : meta
      )
    );
  };
  const guardarTodasMetas = async () => {
    try {
      const actualizaciones = metas.map(async (meta) => {
        const { id, meta_nocturno, meta_matutino, meta_vespertino } = meta;
        const respuesta = await clienteAxios.put(
          `/metas/metas-pulidos/editar/${id}`,
          { meta_nocturno, meta_matutino, meta_vespertino }
        );
        return respuesta.data;
      });
      const metasActualizadas = await Promise.all(actualizaciones);
      setMetas(metasActualizadas);
      swal("Meta actualizada correctamente", "Se han guardado los cambios", "success");
    } catch (error) {
      console.error("Error al guardar las metas de pulidos:", error);
      swal("Error", "No se pudieron guardar los cambios", "error");
    }
  };
  return (
    <div className="p-4 w-full bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-2 text-center text-gray-500">
        Metas Pulido
      </h2>
      <TablaMetas metas={metas} handleInputChange={handleInputChange} />
      <div className="mt-4 text-right">
        <button
          onClick={guardarTodasMetas}
          className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
        >
          <FaSave className="mr-2" />
          Guardar todos
        </button>
      </div>
    </div>
  );
};
export default MetasPulidos;