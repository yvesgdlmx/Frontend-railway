import React, { useEffect, useState } from "react";
import clienteAxios from "../../../config/clienteAxios";
import TablaGenerica from "../others/TablaGenerica";
import { formatNumber } from "../../helpers/formatNumber";
const Nvi = ({ anio, semana }) => {
  const [registros, setRegistros] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await clienteAxios.get(`/reportes/facturacion-nvi/${anio}/${semana}`);
        console.log("Registros Nvi obtenidos:", response.data.registros);
        setRegistros(response.data.registros);
      } catch (error) {
        console.error("Error al obtener los registros (Nvi):", error);
      }
    };
    if (anio && semana) {
      fetchData();
    }
  }, [anio, semana]);
  const data = registros.map((registro) => {
    // Cálculos individuales
    const trabTermNvi = registro.p_frm_f_lenses + registro.m_frm_f_lenses;
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
    // Total NVI fila
    const totalNviFila = terminado + tallado;
    // Total real y diferencia (se utiliza solo la parte entera)
    const totalReal = parseFloat(registro.total_real) || 0;
    const diferencia = Math.trunc(totalReal - totalNviFila);
    // Ajuste en tallado: se suma (o resta) la parte entera de la diferencia
    const talladoAjustado = tallado + diferencia;
    // Ajuste en "trab. NVI HC": se suma la parte entera de la diferencia al valor original (registro.cot_coat)
    const trabNviHC = parseFloat(registro.cot_coat) + Math.trunc(totalReal - totalNviFila);
    // Se mantiene la lógica para NVI HC (para la columna "$ NVI HC")
    const nuevoNviHC = trabNviHC;
    // Ajuste en Total Nvi, conservando la parte decimal de (tallado+terminado)
    const parteEnteraTotalReal = Math.floor(totalReal);
    const parteDecimalTotalNvi = totalNviFila - Math.floor(totalNviFila);
    const totalNviCorregido = parteEnteraTotalReal + parteDecimalTotalNvi;
    return {
      semana: registro.semana,
      fecha: registro.fecha,
      trabTermNvi: formatNumber(trabTermNvi),
      terminado: formatNumber(terminado),
      trabTallNvi: formatNumber(registro.surf_lenses),
      tallado: formatNumber(talladoAjustado),
      trabNviUV: formatNumber(
        parseFloat(registro.uv_s_lenses) + parseFloat(registro.uv_f_lenses)
      ),
      nviUV: formatNumber(parseFloat(registro.uv_s) + parseFloat(registro.uv_f)),
      trabNviHC: formatNumber(trabNviHC),  // Se ha modificado para incluir el ajuste con la diferencia
      nviHC: formatNumber(nuevoNviHC),
      trabNviAR: formatNumber(registro.ar_lenses),
      nviAR: formatNumber(parseFloat(registro.ar)),
      totalTrab: formatNumber(trabTermNvi + Number(registro.surf_lenses)),
      totalNvi: formatNumber(totalNviCorregido),
    };
  });
  // Cálculo de totales con ajuste en tallado y NVI HC usando solo la parte entera de la diferencia
  const totales = registros.reduce(
    (acc, registro) => {
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
      const totalFila = terminado + tallado;
      const totalReal = parseFloat(registro.total_real) || 0;
      const diferencia = Math.trunc(totalReal - totalFila);
      // Ajuste en tallado para el total
      const talladoAjustado = tallado + diferencia;
      // Ajuste en trab. NVI HC para el total: se aplica la parte entera de la diferencia al valor de cot_coat
      const trabNviHC = parseFloat(registro.cot_coat) + Math.trunc(totalReal - totalFila);
      // Otros cálculos (se mantiene la lógica para NVI UV y NVI AR)
      const nviHC = trabNviHC;
      const nviUV = parseFloat(registro.uv_s) + parseFloat(registro.uv_f);
      const nviAR = parseFloat(registro.ar);
      acc.terminado += terminado;
      acc.tallado += talladoAjustado;
      acc.nviUV += nviUV;
      acc.nviHC += nviHC;
      acc.nviAR += nviAR;
      return acc;
    },
    {
      terminado: 0,
      tallado: 0,
      nviUV: 0,
      nviHC: 0,
      nviAR: 0,
    }
  );
  const totalNviGlobal = totales.terminado + totales.tallado;
  const columns = [
    { header: "Semana", accessor: "semana" },
    { header: "Fecha", accessor: "fecha" },
    { header: "Trab term. nvi", accessor: "trabTermNvi" },
    { header: "$ Terminado", accessor: "terminado" },
    { header: "Trab tall. nvi", accessor: "trabTallNvi" },
    { header: "$ Tallado", accessor: "tallado" },
    { header: "Trab. NVI UV", accessor: "trabNviUV" },
    { header: "$ NVI UV", accessor: "nviUV" },
    { header: "Trab. NVI HC", accessor: "trabNviHC" },
    { header: "$ NVI HC", accessor: "nviHC" },
    { header: "Trab NVI AR", accessor: "trabNviAR" },
    { header: "$ NVI AR", accessor: "nviAR" },
    { header: "Total trab. Nvi", accessor: "totalTrab" },
    { header: "Total $ Nvi", accessor: "totalNvi" },
  ];
  return (
    <div className="mb-8">
      {registros.length > 0 && (
        <>
          <h2 className="text-center mb-4 uppercase font-semibold text-2xl text-gray-500">
            NVI
          </h2>
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <TablaGenerica columns={columns} data={data} />
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                  <p className="text-gray-500 font-medium text-sm">$ Terminado</p>
                  <p className="text-2xl font-semibold text-cyan-600">
                    {formatNumber(totales.terminado)}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                  <p className="text-gray-500 font-medium text-sm">$ Tallado</p>
                  <p className="text-2xl font-semibold text-cyan-600">
                    {formatNumber(totales.tallado)}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                  <p className="text-gray-500 font-medium text-sm">$ NVI UV</p>
                  <p className="text-2xl font-semibold text-cyan-600">
                    {formatNumber(totales.nviUV)}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                  <p className="text-gray-500 font-medium text-sm">$ NVI HC</p>
                  <p className="text-2xl font-semibold text-cyan-600">
                    {formatNumber(totales.nviHC)}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                  <p className="text-gray-500 font-medium text-sm">$ NVI AR</p>
                  <p className="text-2xl font-semibold text-cyan-600">
                    {formatNumber(totales.nviAR)}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                  <p className="text-gray-500 font-medium text-sm">
                    Total $ NVI
                  </p>
                  <p className="text-2xl font-semibold text-cyan-600">
                    {formatNumber(totalNviGlobal)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default Nvi;