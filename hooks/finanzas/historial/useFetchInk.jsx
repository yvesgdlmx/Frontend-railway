import { useState, useEffect } from "react";
import clienteAxios from "../../../config/clienteAxios";
import { formatDecimal } from "../../../src/helpers/formatDecimal";
export const useFetchInk = (fechaInicio, fechaFin) => {
  const [inkData, setInkData] = useState([]);
  useEffect(() => {
    const fetchInk = async () => {
      try {
        const response = await clienteAxios.get(
          `/reportes/facturacion-ink/rango/${fechaInicio}/${fechaFin}`
        );
        const registros = response.data.registros.filter(
          (reg) => reg.ShipDate.toLowerCase() !== "totales"
        );
        const grouped = registros.reduce((acc, registro) => {
          const fecha = registro.ShipDate;
          const lensPrice = parseFloat(registro.LensPrice) || 0;
          const coatingsPrice = parseFloat(registro.CoatingsPrice) || 0;
          const tintPrice = parseFloat(registro.TintPrice) || 0;
          const talladoRegistro = lensPrice - coatingsPrice - tintPrice;
          const tintOrdered = parseInt(registro.TintOrdered, 10) === 1 ? 1 : 0;
          if (!acc[fecha]) {
            acc[fecha] = {
              semana: registro.semana,
              fecha,
              ink_trabajosTallados: registro.TotTrabajos
                ? Number(registro.TotTrabajos)
                : 1,
              ink_tallado: talladoRegistro,
              ink_trabajosAR: registro.ARCoating !== null ? 1 : 0,
              ink_ar: registro.ARCoating !== null ? coatingsPrice : 0,
              ink_trabajosTint: tintOrdered,
              ink_tint: tintPrice,
              ink_total: lensPrice
            };
          } else {
            acc[fecha].ink_trabajosTallados += registro.TotTrabajos
              ? Number(registro.TotTrabajos)
              : 1;
            acc[fecha].ink_tallado += talladoRegistro;
            if (registro.ARCoating !== null) {
              acc[fecha].ink_trabajosAR += 1;
              acc[fecha].ink_ar += coatingsPrice;
            }
            acc[fecha].ink_trabajosTint += tintOrdered;
            acc[fecha].ink_tint += tintPrice;
            acc[fecha].ink_total += lensPrice;
          }
          return acc;
        }, {});
        const mapped = Object.values(grouped).map((item) => ({
          ...item,
          ink_tallado: formatDecimal(item.ink_tallado),
          ink_ar: formatDecimal(item.ink_ar),
          ink_tint: formatDecimal(item.ink_tint),
          ink_total: formatDecimal(item.ink_total)
        }));
        setInkData(mapped);
      } catch (error) {
        console.error("Error fetching INK", error);
      }
    };
    fetchInk();
  }, [fechaInicio, fechaFin]);
  return inkData;
};