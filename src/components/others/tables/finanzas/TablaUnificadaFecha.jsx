import React, { useState, useEffect } from "react";
import TablaGenerica2 from "./TablaGenerica2";
import FinanzasWeek from "../../../exportacionesXLSX/FinanzasWeek";
import { useFetchNvi } from "../../../../../hooks/finanzas/historial/useFetchNvi";
import { useFetchHoya } from "../../../../../hooks/finanzas/historial/useFetchHoya";
import { useFetchInk } from "../../../../../hooks/finanzas/historial/useFetchInk";
import { mergeRegistros } from "../../../../../helpers/margeFinanzas";
import { calculateTotales } from "../../../../../helpers/calculateTotales";
import { columnsFinanzas } from "../../../../../config/columnsFinanzas";

const TablaUnificadaFecha = ({ fechaInicio, fechaFin }) => {
  const nviData = useFetchNvi(fechaInicio, fechaFin);
  const hoyaData = useFetchHoya(fechaInicio, fechaFin);
  const inkData = useFetchInk(fechaInicio, fechaFin);
  const [data, setData] = useState([]);
  const [totalesRow, setTotalesRow] = useState(null);
  useEffect(() => {
    const combined = mergeRegistros([nviData, hoyaData, inkData]);
    setData(combined);
  }, [nviData, hoyaData, inkData]);
  useEffect(() => {
    if (data.length) {
      const totals = calculateTotales(data, columnsFinanzas);
      setTotalesRow(totals);
    }
  }, [data]);
  return (
    <div className="mb-8">
      {data.length === 0 ? (
        <p>No hay datos disponibles</p>
      ) : (
        <>
          <FinanzasWeek 
            data={data} 
            columns={columnsFinanzas} 
            filename={`Factura_${fechaInicio}_${fechaFin}.xlsx`} 
          />
          <TablaGenerica2 
            columns={columnsFinanzas} 
            data={data} 
            totalesRow={totalesRow} 
          />
        </>
      )}
    </div>
  );
};
export default TablaUnificadaFecha;