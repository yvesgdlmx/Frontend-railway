import React, { useEffect, useState } from "react";
import clienteAxios from "../../../../config/clienteAxios";

const CardFacturacionNvi = ({ anio, semana }) => {
  const [registros, setRegistros] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Se utiliza el mismo endpoint que en Nvi
        const response = await clienteAxios.get(`/reportes/facturacion-nvi/${anio}/${semana}`);
        console.log("Registros del card NVI obtenidos:", response.data.registros);
        setRegistros(response.data.registros);
      } catch (error) {
        console.error("Error al obtener los registros en Nvi:", error);
      }
    };
    if (anio && semana) {
      fetchData();
    }
  }, [anio, semana]);
  // Por el momento no se muestra nada en la UI
  return null;
};
export default CardFacturacionNvi;