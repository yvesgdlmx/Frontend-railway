import React, { useState, useEffect } from "react";
import TablaGenerica2 from "./TablaGenerica2";
import { useFetchNviWeek } from "../../../../../hooks/finanzas/useFetchNviWeek";
import { useFetchHoyaWeek } from "../../../../../hooks/finanzas/useFetchHoyaWeek";
import { useFetchInkWeek } from "../../../../../hooks/finanzas/useFetchInkWeek";
import { mergeRegistros } from "../../../../../helpers/margeFinanzas";
import { calculateTotales } from "../../../../../helpers/calculateTotales";
import { columnsFinanzas } from "../../../../../config/columnsFinanzas";
import FinanzasWeek from "../../../exportacionesXLSX/FinanzasWeek";
const TablaUnificada = ({ anio, semana }) => {
  const nviData = useFetchNviWeek(anio, semana);
  const hoyaData = useFetchHoyaWeek(anio, semana);
  const inkData = useFetchInkWeek(anio, semana);
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
            filename={`Facturas_Semana${semana}.xlsx`} 
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
export default TablaUnificada;