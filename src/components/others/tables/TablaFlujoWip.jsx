import React, { useRef, useEffect, useState } from "react";
import { formatNumber } from "../../../helpers/formatNumber";
import CardFlujoWipMobile from "../cards/CardFlujoWipMobile";

const columns = [
  { label: "Fecha", key: "fecha" },
  { label: "Hoya Recibidos", key: "hoya_recibidos" },
  { label: "Hoya Cancelados", key: "hoya_cancelados" },
  { label: "Hoya Enviados", key: "hoya_enviados" },
  { label: "Ink Recibidos", key: "ink_recibidos" },
  { label: "Ink Cancelados", key: "ink_cancelados" },
  { label: "Ink Enviados", key: "ink_enviados" },
  { label: "NVI Recibidos", key: "nvi_recibidos" },
  { label: "NVI Cancelados", key: "nvi_cancelados" },
  { label: "NVI Enviados", key: "nvi_enviados" },
  { label: "Total Recibidos", key: "total_recibidos" },
  { label: "Total Cancelados", key: "total_cancelados" },
  { label: "Total Enviados", key: "total_enviados" },
];

function agruparPorDia(registros) {
  const datosPorDia = {};
  registros.forEach((registro) => {
    if (!datosPorDia[registro.fecha]) {
      datosPorDia[registro.fecha] = {
        recibidos: null,
        enviados: null,
        cancelados: null,
      };
    }
    if (registro.accion === "recibidos") {
      datosPorDia[registro.fecha].recibidos = registro;
    } else if (registro.accion === "enviados") {
      datosPorDia[registro.fecha].enviados = registro;
    } else if (registro.accion === "cancelados") {
      datosPorDia[registro.fecha].cancelados = registro;
    }
  });
  return datosPorDia;
}

function calcularTotales(datosPorDia, fechasOrdenadas) {
  const totales = {
    hoya_recibidos: 0,
    hoya_cancelados: 0,
    hoya_enviados: 0,
    ink_recibidos: 0,
    ink_cancelados: 0,
    ink_enviados: 0,
    nvi_recibidos: 0,
    nvi_cancelados: 0,
    nvi_enviados: 0,
  };

  fechasOrdenadas.forEach((fecha) => {
    const dia = datosPorDia[fecha];
    if (dia.recibidos) totales.hoya_recibidos += dia.recibidos.total_hoya || 0;
    if (dia.cancelados) totales.hoya_cancelados += dia.cancelados.total_hoya || 0;
    if (dia.enviados) totales.hoya_enviados += dia.enviados.total_hoya || 0;
    if (dia.recibidos) totales.ink_recibidos += dia.recibidos.total_ink || 0;
    if (dia.cancelados) totales.ink_cancelados += dia.cancelados.total_ink || 0;
    if (dia.enviados) totales.ink_enviados += dia.enviados.total_ink || 0;
    if (dia.recibidos) totales.nvi_recibidos += dia.recibidos.total_nvi || 0;
    if (dia.cancelados) totales.nvi_cancelados += dia.cancelados.total_nvi || 0;
    if (dia.enviados) totales.nvi_enviados += dia.enviados.total_nvi || 0;
  });

  return totales;
}

function TablaFlujoWip({ registros }) {
  const datosPorDia = agruparPorDia(registros);
  const fechasOrdenadas = Object.keys(datosPorDia).sort((a, b) => a.localeCompare(b));
  const totales = calcularTotales(datosPorDia, fechasOrdenadas);

  const totalRecibidosAll = fechasOrdenadas.reduce((acc, fecha) => {
    const dia = datosPorDia[fecha];
    return (
      acc +
      (dia.recibidos?.total_hoya || 0) +
      (dia.recibidos?.total_ink || 0) +
      (dia.recibidos?.total_nvi || 0)
    );
  }, 0);
  const totalCanceladosAll = fechasOrdenadas.reduce((acc, fecha) => {
    const dia = datosPorDia[fecha];
    return (
      acc +
      (dia.cancelados?.total_hoya || 0) +
      (dia.cancelados?.total_ink || 0) +
      (dia.cancelados?.total_nvi || 0)
    );
  }, 0);
  const totalEnviadosAll = fechasOrdenadas.reduce((acc, fecha) => {
    const dia = datosPorDia[fecha];
    return (
      acc +
      (dia.enviados?.total_hoya || 0) +
      (dia.enviados?.total_ink || 0) +
      (dia.enviados?.total_nvi || 0)
    );
  }, 0);

  // Sticky header logic
  const tableRef = useRef();
  const stickyRef = useRef();
  const [colWidths, setColWidths] = useState([]);

  // Sincroniza anchos de columnas
  useEffect(() => {
    if (tableRef.current) {
      const ths = tableRef.current.querySelectorAll("thead th");
      setColWidths(Array.from(ths).map((th) => th.offsetWidth));
    }
  }, [registros, fechasOrdenadas.length]);

  useEffect(() => {
    const handleResize = () => {
      if (tableRef.current) {
        const ths = tableRef.current.querySelectorAll("thead th");
        setColWidths(Array.from(ths).map((th) => th.offsetWidth));
      }
      syncStickyHeaderPosition();
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", syncStickyHeaderPosition);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", syncStickyHeaderPosition);
    };
    // eslint-disable-next-line
  }, []);

  // Sincroniza posición y ancho del sticky header
  function syncStickyHeaderPosition() {
    if (!tableRef.current || !stickyRef.current) return;
    const rect = tableRef.current.getBoundingClientRect();
    stickyRef.current.style.width = rect.width + "px";
    stickyRef.current.style.left = rect.left + window.scrollX + "px";
  }

  useEffect(() => {
    syncStickyHeaderPosition();
    // eslint-disable-next-line
  }, [colWidths]);

  // Sticky header visibility
  useEffect(() => {
    function onScroll() {
      if (!tableRef.current || !stickyRef.current) return;
      const rect = tableRef.current.getBoundingClientRect();
      if (rect.top < 0 && rect.bottom > 0) {
        stickyRef.current.style.display = "block";
      } else {
        stickyRef.current.style.display = "none";
      }
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="overflow-x-auto">
      {/* Sticky header */}
      <div
        ref={stickyRef}
        style={{
          position: "fixed",
          top: "110px", // Ajusta según tu header
          zIndex: 50,
          background: "#3b82f6",
          display: "none",
        }}
        className="hidden md:block"
        id="sticky-header"
      >
        <table className="min-w-full">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key}
                  style={{
                    width: colWidths[idx] ? `${colWidths[idx]}px` : "auto",
                    background: "#3b82f6",
                    color: "white",
                    border: "1px solid #e5e7eb",
                    fontWeight: 600,
                  }}
                  className="py-3 px-5 text-left font-semibold text-white border text-sm"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>
      {/* Tabla principal */}
      <div>
        <table
          ref={tableRef}
          className="min-w-full bg-white border border-gray-200 rounded-lg shadow-lg hidden md:table"
        >
          <thead className="text-sm">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="py-3 px-5 text-left font-semibold bg-blue-500 text-white border"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm text-center">
            {fechasOrdenadas.map((fecha, index) => {
              const dia = datosPorDia[fecha];
              const totalRecibidos =
                (dia.recibidos?.total_hoya || 0) +
                (dia.recibidos?.total_ink || 0) +
                (dia.recibidos?.total_nvi || 0);
              const totalCancelados =
                (dia.cancelados?.total_hoya || 0) +
                (dia.cancelados?.total_ink || 0) +
                (dia.cancelados?.total_nvi || 0);
              const totalEnviados =
                (dia.enviados?.total_hoya || 0) +
                (dia.enviados?.total_ink || 0) +
                (dia.enviados?.total_nvi || 0);

              return (
                <tr
                  key={fecha}
                  className={`border-t border-gray-200 hover:bg-blue-100 ${
                    index % 2 === 0 ? "bg-white" : "bg-blue-50"
                  }`}
                >
                  <td className="py-3 px-5 border font-semibold text-gray-500">
                    {fecha}
                  </td>
                  <td className="py-3 px-5 border font-semibold text-gray-500">
                    {dia.recibidos
                      ? formatNumber(dia.recibidos.total_hoya)
                      : "-"}
                  </td>
                  <td className="py-3 px-5 border font-semibold text-gray-500">
                    {dia.cancelados
                      ? formatNumber(dia.cancelados.total_hoya)
                      : "-"}
                  </td>
                  <td className="py-3 px-5 border font-semibold text-gray-500">
                    {dia.enviados
                      ? formatNumber(dia.enviados.total_hoya)
                      : "-"}
                  </td>
                  <td className="py-3 px-5 border font-semibold text-gray-500">
                    {dia.recibidos
                      ? formatNumber(dia.recibidos.total_ink)
                      : "-"}
                  </td>
                  <td className="py-3 px-5 border font-semibold text-gray-500">
                    {dia.cancelados
                      ? formatNumber(dia.cancelados.total_ink)
                      : "-"}
                  </td>
                  <td className="py-3 px-5 border font-semibold text-gray-500">
                    {dia.enviados
                      ? formatNumber(dia.enviados.total_ink)
                      : "-"}
                  </td>
                  <td className="py-3 px-5 border font-semibold text-gray-500">
                    {dia.recibidos
                      ? formatNumber(dia.recibidos.total_nvi)
                      : "-"}
                  </td>
                  <td className="py-3 px-5 border font-semibold text-gray-500">
                    {dia.cancelados
                      ? formatNumber(dia.cancelados.total_nvi)
                      : "-"}
                  </td>
                  <td className="py-3 px-5 border font-semibold text-gray-500">
                    {dia.enviados
                      ? formatNumber(dia.enviados.total_nvi)
                      : "-"}
                  </td>
                  <td className="py-3 px-5 border font-semibold text-green-700">
                    {formatNumber(totalRecibidos)}
                  </td>
                  <td className="py-3 px-5 border font-semibold text-green-700">
                    {formatNumber(totalCancelados)}
                  </td>
                  <td className="py-3 px-5 border font-semibold text-green-700">
                    {formatNumber(totalEnviados)}
                  </td>
                </tr>
              );
            })}
            {fechasOrdenadas.length > 0 && (
              <tr className="bg-green-500 text-white font-bold border-t-2">
                <td className="py-3 px-5 border font-bold">TOTALES</td>
                <td className="py-3 px-5 border">
                  {formatNumber(totales.hoya_recibidos)}
                </td>
                <td className="py-3 px-5 border">
                  {formatNumber(totales.hoya_cancelados)}
                </td>
                <td className="py-3 px-5 border">
                  {formatNumber(totales.hoya_enviados)}
                </td>
                <td className="py-3 px-5 border">
                  {formatNumber(totales.ink_recibidos)}
                </td>
                <td className="py-3 px-5 border">
                  {formatNumber(totales.ink_cancelados)}
                </td>
                <td className="py-3 px-5 border">
                  {formatNumber(totales.ink_enviados)}
                </td>
                <td className="py-3 px-5 border">
                  {formatNumber(totales.nvi_recibidos)}
                </td>
                <td className="py-3 px-5 border">
                  {formatNumber(totales.nvi_cancelados)}
                </td>
                <td className="py-3 px-5 border">
                  {formatNumber(totales.nvi_enviados)}
                </td>
                <td className="py-3 px-5 border font-bold text-white">
                  {formatNumber(totalRecibidosAll)}
                </td>
                <td className="py-3 px-5 border font-bold text-white">
                  {formatNumber(totalCanceladosAll)}
                </td>
                <td className="py-3 px-5 border font-bold text-white">
                  {formatNumber(totalEnviadosAll)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Vista para móviles y pantallas medianas */}
      <div className="md:hidden space-y-4">
        {fechasOrdenadas.map((fecha) => {
          const dia = datosPorDia[fecha];
          return (
            <CardFlujoWipMobile key={fecha} fecha={fecha} dia={dia} />
          );
        })}
        {/* Card de totales para móvil */}
        {fechasOrdenadas.length > 0 && (
          <div className="bg-blue-600 text-white rounded-lg overflow-hidden border border-blue-700 shadow-md">
            <div className="bg-blue-700 text-white p-4">
              <div className="font-bold text-lg">TOTALES</div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              {/* Hoya */}
              <div className="border-b border-blue-400 pb-2 flex justify-between">
                <span className="text-blue-200">Hoya Recibidos:</span>
                <span className="font-bold">{formatNumber(totales.hoya_recibidos)}</span>
              </div>
              <div className="border-b border-blue-400 pb-2 flex justify-between">
                <span className="text-blue-200">Hoya Cancelados:</span>
                <span className="font-bold">{formatNumber(totales.hoya_cancelados)}</span>
              </div>
              <div className="border-b border-blue-400 pb-2 flex justify-between">
                <span className="text-blue-200">Hoya Enviados:</span>
                <span className="font-bold">{formatNumber(totales.hoya_enviados)}</span>
              </div>
              {/* Ink */}
              <div className="border-b border-blue-400 pb-2 flex justify-between">
                <span className="text-blue-200">Ink Recibidos:</span>
                <span className="font-bold">{formatNumber(totales.ink_recibidos)}</span>
              </div>
              <div className="border-b border-blue-400 pb-2 flex justify-between">
                <span className="text-blue-200">Ink Cancelados:</span>
                <span className="font-bold">{formatNumber(totales.ink_cancelados)}</span>
              </div>
              <div className="border-b border-blue-400 pb-2 flex justify-between">
                <span className="text-blue-200">Ink Enviados:</span>
                <span className="font-bold">{formatNumber(totales.ink_enviados)}</span>
              </div>
              {/* NVI */}
              <div className="border-b border-blue-400 pb-2 flex justify-between">
                <span className="text-blue-200">NVI Recibidos:</span>
                <span className="font-bold">{formatNumber(totales.nvi_recibidos)}</span>
              </div>
              <div className="border-b border-blue-400 pb-2 flex justify-between">
                <span className="text-blue-200">NVI Cancelados:</span>
                <span className="font-bold">{formatNumber(totales.nvi_cancelados)}</span>
              </div>
              <div className="border-b border-blue-400 pb-2 flex justify-between">
                <span className="text-blue-200">NVI Enviados:</span>
                <span className="font-bold">{formatNumber(totales.nvi_enviados)}</span>
              </div>
              {/* Totales generales */}
              <div className="border-b border-blue-400 pb-2 flex justify-between col-span-2">
                <span className="text-white font-semibold">Total Recibidos:</span>
                <span className="font-bold text-white">{formatNumber(totalRecibidosAll)}</span>
              </div>
              <div className="border-b border-blue-400 pb-2 flex justify-between col-span-2">
                <span className="text-white font-semibold">Total Cancelados:</span>
                <span className="font-bold text-white">{formatNumber(totalCanceladosAll)}</span>
              </div>
              <div className="pb-2 flex justify-between col-span-2">
                <span className="text-white font-semibold">Total Enviados:</span>
                <span className="font-bold text-white">{formatNumber(totalEnviadosAll)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TablaFlujoWip;