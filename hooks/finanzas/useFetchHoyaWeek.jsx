import { useState, useEffect } from "react";
import clienteAxios from "../../config/clienteAxios";
import { formatDecimal } from "../../src/helpers/formatDecimal";
export const useFetchHoyaWeek = (anio, semana) => {
  const [hoyaData, setHoyaData] = useState([]);
  useEffect(() => {
    const fetchHoya = async () => {
      try {
        const response = await clienteAxios.get(
          `/reportes/facturacion-hoya/${anio}/${semana}`
        );
        const registros = response.data.registros.filter(
          (reg) => reg.fecha.toLowerCase() !== "totales"
        );
        const mapped = registros.map((registro) => ({
          semana: registro.semana,
          fecha: registro.fecha,
          hoya_trabajosTallados: registro.trabajos_tallados,
          hoya_precioTallado: formatDecimal(registro.precio_tallado),
          hoya_trabajosHC: registro.trabajos_hc,
          hoya_precioHC: formatDecimal(registro.precio_hc),
          hoya_trabajosArPremium: registro.trabajos_ar_premium,
          hoya_precioArPremium: formatDecimal(registro.precio_ar_premium),
          hoya_trabajosArStandard: registro.trabajos_ar_standard,
          hoya_precioArStandard: formatDecimal(registro.precio_ar_standard),
          hoya_totalPrecio: formatDecimal(registro.total_precio)
        }));
        setHoyaData(mapped);
      } catch (error) {
        console.error("Error fetching HOYA", error);
      }
    };
    if (anio && semana) {
      fetchHoya();
    }
  }, [anio, semana]);
  return hoyaData;
};