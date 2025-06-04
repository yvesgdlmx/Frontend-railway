import { useState, useEffect } from "react";
import clienteAxios from "../../../config/clienteAxios";
import { formatDecimal } from "../../../src/helpers/formatDecimal";
import { formatNumber } from "../../../src/helpers/formatNumber";
export const useFetchNvi = (fechaInicio, fechaFin) => {
  const [nviData, setNviData] = useState([]);
  useEffect(() => {
    const fetchNvi = async () => {
      try {
        const response = await clienteAxios.get(
          `/reportes/facturacion-nvi/rango/${fechaInicio}/${fechaFin}`
        );
        const registros = response.data.registros.filter(
          (reg) => reg.fecha.toLowerCase() !== "totales"
        );
        const mapped = registros.map((registro) => {
          const trabTerm = registro.p_frm_f_lenses + registro.m_frm_f_lenses;
          const terminado =
            parseFloat(registro.p_frm_f) +
            parseFloat(registro.m_frm_f) +
            parseFloat(registro.grad_f) +
            parseFloat(registro.sol_f) +
            parseFloat(registro.uv_f);
          const tallado =
            parseFloat(registro.cot_coat) +
            parseFloat(registro.surf_cost) +
            parseFloat(registro.ar) +
            parseFloat(registro.grad_s) +
            parseFloat(registro.sol_s) +
            parseFloat(registro.uv_s) +
            parseFloat(registro.p_frm_s) +
            parseFloat(registro.m_frm_s) +
            parseFloat(registro.ar_lenses);
          const totalNviFila = terminado + tallado;
          const totalReal = parseFloat(registro.total_real) || 0;
          const diferencia = Math.trunc(totalReal - totalNviFila);
          const talladoAjustado = tallado + diferencia;
          const trabNviHC =
            parseFloat(registro.cot_coat) +
            Math.trunc(totalReal - totalNviFila);
          const nuevoNviHC = trabNviHC;
          const parteEnteraTotalReal = Math.floor(totalReal);
          const parteDecimalTotalNvi =
            totalNviFila - Math.floor(totalNviFila);
          const totalNviCorregido =
            parteEnteraTotalReal + parteDecimalTotalNvi;
          return {
            semana: registro.semana,
            fecha: registro.fecha,
            nvi_trabTermNvi: formatNumber(trabTerm),
            nvi_terminado: formatNumber(terminado),
            nvi_trabTallNvi: formatNumber(registro.surf_lenses),
            nvi_tallado: formatNumber(talladoAjustado),
            nvi_trabNviUV: formatNumber(
              parseFloat(registro.uv_s_lenses) +
                parseFloat(registro.uv_f_lenses)
            ),
            nvi_nviUV: formatNumber(
              parseFloat(registro.uv_s) + parseFloat(registro.uv_f)
            ),
            nvi_trabNviHC: formatNumber(trabNviHC),
            nvi_nviHC: formatNumber(nuevoNviHC),
            nvi_trabNviAR: formatNumber(registro.ar_lenses),
            nvi_nviAR: formatNumber(parseFloat(registro.ar)),
            nvi_totalTrab: formatNumber(trabTerm + Number(registro.surf_lenses)),
            nvi_totalNvi: formatNumber(totalNviCorregido)
          };
        });
        setNviData(mapped);
      } catch (error) {
        console.error("Error fetching NVI", error);
      }
    };
    fetchNvi();
  }, [fechaInicio, fechaFin]);
  return nviData;
};