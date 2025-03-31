import React, { useEffect, useState } from "react";
import clienteAxios from "../../../config/clienteAxios";
import TablaGenerica from "../others/TablaGenerica";
import { formatDecimal } from "../../helpers/formatDecimal";
const Hoya = ({ anio, semana }) => {
  const [registros, setRegistros] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await clienteAxios.get(`/reportes/facturacion-hoya/${anio}/${semana}`);
        console.log("Registros Hoya obtenidos:", response.data.registros);
        setRegistros(response.data.registros);
      } catch (error) {
        console.error("Error al obtener los registros Hoya:", error);
      }
    };
    if (anio && semana) {
      fetchData();
    }
  }, [anio, semana]);
  const data = registros.map((registro) => ({
    semana: registro.semana,
    fecha: registro.fecha,
    trabajosTallados: registro.trabajos_tallados,
    precioTallado: formatDecimal(registro.precio_tallado),
    trabajosHC: registro.trabajos_hc,
    precioHC: formatDecimal(registro.precio_hc),
    trabajosArPremium: registro.trabajos_ar_premium,
    precioArPremium: formatDecimal(registro.precio_ar_premium),
    trabajosArStandard: registro.trabajos_ar_standard,
    precioArStandard: formatDecimal(registro.precio_ar_standard),
    totalPrecio: formatDecimal(registro.total_precio)
  }));
  const columns = [
    { header: "Semana", accessor: "semana" },
    { header: "Fecha", accessor: "fecha" },
    { header: "Trab. Tallados", accessor: "trabajosTallados" },
    { header: "$ Tallado", accessor: "precioTallado" },
    { header: "Trab. HC", accessor: "trabajosHC" },
    { header: "$ HC", accessor: "precioHC" },
    { header: "Trab. AR Premium", accessor: "trabajosArPremium" },
    { header: "$ AR Premium", accessor: "precioArPremium" },
    { header: "Trab. AR Standard", accessor: "trabajosArStandard" },
    { header: "$ AR Standard", accessor: "precioArStandard" },
    { header: "Total Precio", accessor: "totalPrecio" }
  ];
  const totals = registros.reduce(
    (acc, registro) => {
      acc.trabajosTallados += Number(registro.trabajos_tallados);
      acc.precioTallado += parseFloat(registro.precio_tallado);
      acc.trabajosHC += Number(registro.trabajos_hc);
      acc.precioHC += parseFloat(registro.precio_hc);
      acc.trabajosArPremium += Number(registro.trabajos_ar_premium);
      acc.precioArPremium += parseFloat(registro.precio_ar_premium);
      acc.trabajosArStandard += Number(registro.trabajos_ar_standard);
      acc.precioArStandard += parseFloat(registro.precio_ar_standard);
      acc.totalPrecio += parseFloat(registro.total_precio);
      return acc;
    },
    {
      trabajosTallados: 0,
      precioTallado: 0,
      trabajosHC: 0,
      precioHC: 0,
      trabajosArPremium: 0,
      precioArPremium: 0,
      trabajosArStandard: 0,
      precioArStandard: 0,
      totalPrecio: 0
    }
  );
  return (
    <div className="mb-8">
      {registros.length > 0 && (
        <>
        <h2 className="text-center mb-4 uppercase font-semibold text-2xl text-gray-500">HOYA</h2>
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <TablaGenerica columns={columns} data={data} />
          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="text-gray-500 font-medium text-sm">$ Tallado</p>
                <p className="text-2xl font-semibold text-cyan-600">
                  {formatDecimal(totals.precioTallado)}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="text-gray-500 font-medium text-sm">$ HC</p>
                <p className="text-2xl font-semibold text-cyan-600">
                  {formatDecimal(totals.precioHC)}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="text-gray-500 font-medium text-sm">$ AR Premium</p>
                <p className="text-2xl font-semibold text-cyan-600">
                  {formatDecimal(totals.precioArPremium)}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="text-gray-500 font-medium text-sm">$ AR Standard</p>
                <p className="text-2xl font-semibold text-cyan-600">
                  {formatDecimal(totals.precioArStandard)}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="text-gray-500 font-medium text-sm">Total Precio</p>
                <p className="text-2xl font-semibold text-cyan-600">
                  {formatDecimal(totals.totalPrecio)}
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
export default Hoya;
