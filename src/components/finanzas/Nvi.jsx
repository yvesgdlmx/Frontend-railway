import React, { useEffect, useState } from "react";
import clienteAxios from "../../../config/clienteAxios";
import TablaGenerica from "../others/TablaGenerica";
import { formatNumber } from "../../helpers/formatNumber";
const Nvi = ({ anio, semana }) => {
  const [registros, setRegistros] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Se utiliza la URL con los parámetros anio y semana
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
  // Mapeamos cada registro para generar los datos a mostrar en la tabla
  const data = registros.map((registro) => {
    const trabTermNvi = registro.p_frm_f_lenses + registro.m_frm_f_lenses;
    const terminado =
      parseFloat(registro.p_frm_f) +
      parseFloat(registro.m_frm_f) +
      parseFloat(registro.grad_f) +
      parseFloat(registro.sol_f) +
      parseFloat(registro.uv_f);
    // Se incorpora p_frm_s y m_frm_s al cálculo de tallado
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
    const trabNviUV =
      parseFloat(registro.uv_s_lenses) + parseFloat(registro.uv_f_lenses);
    const nviUV = parseFloat(registro.uv_s) + parseFloat(registro.uv_f);
    // El totalTrabNvi en este mapping se puede dejar como cálculo de estilos o montos parciales,
    // pero puesto que queremos que el "Total $ Nvi" sea la suma de $ Terminado, $ tallado, $ NVI UV, $ NVI HC y $ NVI AR,
    // en la sección de totales se recalculará de forma global.
    const totalTrab = trabTermNvi + Number(registro.surf_lenses);
    return {
      semana: registro.semana,
      fecha: registro.fecha,
      trabTermNvi: formatNumber(trabTermNvi),
      terminado: formatNumber(terminado),
      trabTallNvi: formatNumber(registro.surf_lenses),
      tallado: formatNumber(tallado),
      trabNviUV: formatNumber(trabNviUV),
      nviUV: formatNumber(nviUV),
      trabNviHC: formatNumber(registro.cot_lenses),
      nviHC: formatNumber(parseFloat(registro.cot_coat)),
      trabNviAR: formatNumber(registro.ar_lenses),
      nviAR: formatNumber(parseFloat(registro.ar)),
      totalTrab: formatNumber(totalTrab)
      // totalTrabNvi se calculará en la sección de totales globales
    };
  });
  // Cálculo de totales para cada columna monetaria
  const totales = registros.reduce(
    (acc, registro) => {
      const terminado =
        parseFloat(registro.p_frm_f) +
        parseFloat(registro.m_frm_f) +
        parseFloat(registro.grad_f) +
        parseFloat(registro.sol_f) +
        parseFloat(registro.uv_f);
      // Se actualiza tallado sumando p_frm_s y m_frm_s
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
      const nviUV = parseFloat(registro.uv_s) + parseFloat(registro.uv_f);
      const nviHC = parseFloat(registro.cot_coat);
      const nviAR = parseFloat(registro.ar);
      acc.terminado += terminado;
      acc.tallado += tallado;
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
      nviAR: 0
    }
  );
  // Ahora se define el Total $ Nvi a partir
  // de la suma de los totales monetarios: $ Terminado + $ tallado + $ NVI UV + $ NVI HC + $ NVI AR.
  const totalNvi = totales.terminado + totales.tallado;
  // Definición de las columnas para la tabla
  const columns = [
    { header: "Semana", accessor: "semana" },
    { header: "Fecha", accessor: "fecha" },
    { header: "Trab term. nvi", accessor: "trabTermNvi" },
    { header: "$ Terminado", accessor: "terminado" },
    { header: "Trab tall. nvi", accessor: "trabTallNvi" },
    { header: "$ tallado", accessor: "tallado" },
    { header: "Trab. NVI UV", accessor: "trabNviUV" },
    { header: "$ NVI UV", accessor: "nviUV" },
    { header: "Trab. NVI HC", accessor: "trabNviHC" },
    { header: "$ NVI HC", accessor: "nviHC" },
    { header: "Trab NVI AR", accessor: "trabNviAR" },
    { header: "$ NVI AR", accessor: "nviAR" },
    { header: "Total trab. Nvi", accessor: "totalTrab" }
    // Se omite totalTrabNvi a nivel de registro, ya que se calcula el total global abajo.
  ];
  return (
    <div className="mb-8">
      {registros.length > 0 && (
        <>
          <h2 className="text-center mb-4 uppercase font-semibold text-2xl text-gray-500">NVI</h2>
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <TablaGenerica columns={columns} data={data} />
            {/* Sección de totales con diseño refinado y compacto */}
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
                  <p className="text-gray-500 font-medium text-sm">Total $ NVI</p>
                  <p className="text-2xl font-semibold text-cyan-600">
                    {formatNumber(totalNvi)}
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