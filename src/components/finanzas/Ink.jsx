import React, { useEffect, useState } from "react";
import clienteAxios from "../../../config/clienteAxios";
import TablaGenerica from "../others/TablaGenerica";
import { formatDecimal} from "../../helpers/formatDecimal";
import { formatNumber } from "../../helpers/formatNumber";

const Ink = ({ anio, semana }) => {
  const [registros, setRegistros] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Se utiliza la URL correspondiente para facturación Ink
        const response = await clienteAxios.get(
          `/reportes/facturacion-ink/${anio}/${semana}`
        );
        console.log("Registros Ink obtenidos:", response.data.registros);
        setRegistros(response.data.registros);
      } catch (error) {
        console.error("Error al obtener los registros Ink:", error);
      }
    };
    if (anio && semana) {
      fetchData();
    }
  }, [anio, semana]);
  // Agrupar los registros por ShipDate y calcular las columnas necesarias
  const grouped = registros.reduce((acc, registro) => {
    const fecha = registro.ShipDate;
    // Valores utilizados para $ Tallado
    const lensPrice = parseFloat(registro.LensPrice) || 0;
    const coatingsPrice = parseFloat(registro.CoatingsPrice) || 0;
    const tintPriceIndividual = parseFloat(registro.TintPrice) || 0;
    const talladoRegistro = lensPrice - coatingsPrice - tintPriceIndividual;
    // Cálculo de Trabajos tint: se cuenta sólo si TintOrdered es 1
    const tintOrdered = parseInt(registro.TintOrdered) === 1 ? 1 : 0;
    const tintPrice = tintPriceIndividual; // ya es número
    if (!acc[fecha]) {
      acc[fecha] = {
        semana: registro.semana, // se asume que la semana es la misma para todos los registros de esa fecha
        fecha,
        trabajosTallados: 1,
        tallado: talladoRegistro,
        trabajosAR: registro.ARCoating !== null ? 1 : 0,
        ar: registro.ARCoating !== null ? (parseFloat(registro.CoatingsPrice) || 0) : 0,
        trabajosTint: tintOrdered,
        tint: tintPrice,
        total: lensPrice  // Suma de LensPrice para el grupo
      };
    } else {
      acc[fecha].trabajosTallados += 1;
      acc[fecha].tallado += talladoRegistro;
      if (registro.ARCoating !== null) {
        acc[fecha].trabajosAR += 1;
        acc[fecha].ar += (parseFloat(registro.CoatingsPrice) || 0);
      }
      acc[fecha].trabajosTint += tintOrdered;
      acc[fecha].tint += tintPrice;
      acc[fecha].total += lensPrice;
    }
    return acc;
  }, {});
  // Convertir el objeto agrupado en un array
  const data = Object.values(grouped);
  // Calcular totales para las columnas de dinero usando los valores numéricos de cada grupo
  const totals = data.reduce(
    (acc, item) => ({
      tallado: acc.tallado + item.tallado,
      ar: acc.ar + item.ar,
      tint: acc.tint + item.tint,
      total: acc.total + item.total
    }),
    { tallado: 0, ar: 0, tint: 0, total: 0 }
  );
  // Formatear los valores numéricos requeridos para la tabla
  const formattedData = data.map((item) => ({
    ...item,
    tallado: formatDecimal(item.tallado),
    ar: formatDecimal(item.ar),
    tint: formatDecimal(item.tint),
    total: formatDecimal(item.total)
  }));
  // Definir las columnas para la tabla
  const columns = [
    { header: "Semana", accessor: "semana" },
    { header: "Fecha", accessor: "fecha" },
    { header: "Trabajos tallados", accessor: "trabajosTallados" },
    { header: "$ Tallado", accessor: "tallado" },
    { header: "Trabajos AR", accessor: "trabajosAR" },
    { header: "$ AR", accessor: "ar" },
    { header: "Trabajos tint", accessor: "trabajosTint" },
    { header: "$ tint", accessor: "tint" },
    { header: "$ Total", accessor: "total" }
  ];
  return (
    <div className="mb-8">
      {formattedData.length > 0 && (
        <>
          <h2 className="text-center mb-4 uppercase font-semibold text-2xl text-gray-500">Ink</h2>
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <TablaGenerica columns={columns} data={formattedData} />
            {/* Sección de totales para las columnas de dinero */}
            <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                    <p className="text-gray-500 font-medium text-sm">$ Tallado</p>
                    <p className="text-2xl font-semibold text-cyan-600">
                    {formatNumber(totals.tallado)}
                    </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                    <p className="text-gray-500 font-medium text-sm">$ AR</p>
                    <p className="text-2xl font-semibold text-cyan-600">
                    {formatNumber(totals.ar)}
                    </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                    <p className="text-gray-500 font-medium text-sm">$ tint</p>
                    <p className="text-2xl font-semibold text-cyan-600">
                    {formatDecimal(totals.tint)}
                    </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                    <p className="text-gray-500 font-medium text-sm">$ Total</p>
                    <p className="text-2xl font-semibold text-cyan-600">
                    {formatNumber(totals.total)}
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
export default Ink;