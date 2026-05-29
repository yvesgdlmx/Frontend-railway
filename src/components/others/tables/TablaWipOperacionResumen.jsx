import React, { useState } from "react";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/solid";

const TablaWipOperacionResumen = ({
  bloque,
  columnasPrincipales,
  formatNumber,
  getFechaCorta,
  obtenerTotalDetalle,
  obtenerTotalFila,
  obtenerTotalColumna,
  obtenerTotalColumnaRegistro,
  obtenerTotalDetalleColumna,
  obtenerTotalGeneralBloque,
}) => {
  const [columnasExpandidas, setColumnasExpandidas] = useState({});

  const getDetalleHeaderClass = (
    detalleIndex,
    totalDetalles,
    sinBordeDerecho = false
  ) => {
    const bordeInicial =
      detalleIndex === 0 ? "border-l-2 border-l-slate-500" : "";
    const bordeFinal =
      detalleIndex === totalDetalles - 1 && !sinBordeDerecho
        ? "border-r-2 border-r-slate-500"
        : "";

    return `px-3 py-2.5 sm:px-4 sm:py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-700 bg-slate-100 whitespace-nowrap border-r border-slate-300 ${bordeInicial} ${bordeFinal}`;
  };

  const getDetalleCellClass = (
    detalleIndex,
    totalDetalles,
    isTotal = false,
    sinBordeDerecho = false
  ) => {
    const bordeInicial =
      detalleIndex === 0 ? "border-l-2 border-l-slate-500" : "";
    const bordeFinal =
      detalleIndex === totalDetalles - 1 && !sinBordeDerecho
        ? "border-r-2 border-r-slate-500"
        : "";
    const fondo = isTotal
      ? "bg-slate-600 font-bold text-white"
      : "bg-slate-50/80 text-slate-700";

    return `px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-center border-r border-slate-200 ${fondo} ${bordeInicial} ${bordeFinal}`;
  };

  const totalGeneralHeaderClass =
    "border-b border-r border-slate-300 bg-slate-200 px-3 py-2.5 text-center text-xs font-bold text-slate-800 sm:px-4 sm:py-3 sm:text-sm";

  const totalGeneralCellClass =
    "border-b border-r border-slate-200 bg-slate-50 px-3 py-2.5 text-center text-xs font-extrabold text-slate-800 shadow-[inset_4px_0_0_#94a3b8] sm:px-4 sm:py-3 sm:text-sm";

  const totalGeneralFooterCellClass =
    "border-r border-t-2 border-slate-500 bg-slate-600 px-3 py-2.5 text-center text-xs font-extrabold text-white shadow-[inset_4px_0_0_#cbd5e1] sm:px-4 sm:py-3 sm:text-sm";

  const toggleColumna = (key) => {
    setColumnasExpandidas((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="max-w-full overflow-x-auto overscroll-x-contain rounded-lg border border-slate-200 shadow-sm">
      <table className="min-w-[980px] border-separate border-spacing-0 bg-white xl:min-w-full">
        <thead>
          <tr>
            <th
              rowSpan={2}
              className="sticky left-0 z-20 border-b border-r border-slate-200 bg-slate-100 px-3 py-2.5 text-center text-xs font-bold text-slate-700 sm:px-4 sm:py-3 sm:text-sm"
            >
              Fecha WIP
            </th>

            {columnasPrincipales.map((columna) => {
              const expandida = columnasExpandidas[columna.key];
              const tieneDetalle = columna.detalles.length > 0;

              if (expandida && tieneDetalle) {
                const esDetallado = columna.key === "total_detallado";

                return (
                  <th
                    key={columna.key}
                    colSpan={columna.detalles.length}
                    className={`border-b border-l-2 border-slate-500 bg-slate-800 px-3 py-2.5 text-center text-xs font-bold text-white shadow-inner sm:px-4 sm:py-3 sm:text-sm ${
                      esDetallado
                        ? "border-r border-r-slate-300"
                        : "border-r-2 border-r-slate-500"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => toggleColumna(columna.key)}
                        className="rounded border border-white/20 bg-white/10 p-1 transition hover:bg-white/20"
                        title={`Contraer ${columna.label}`}
                        aria-label={`Contraer ${columna.label}`}
                      >
                        <MinusIcon className="h-4 w-4 text-white" />
                      </button>
                      {columna.label}
                    </div>
                  </th>
                );
              }

              return (
                <th
                  key={columna.key}
                  rowSpan={2}
                  className="border-b border-r border-slate-200 bg-slate-100 px-3 py-2.5 text-center text-xs font-bold text-slate-700 sm:px-4 sm:py-3 sm:text-sm"
                >
                  <div className="flex items-center justify-center gap-2">
                    {tieneDetalle && (
                      <button
                        onClick={() => toggleColumna(columna.key)}
                        className="rounded border border-slate-300 bg-white p-1 text-slate-600 shadow-sm transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                        title={`Expandir ${columna.label}`}
                        aria-label={`Expandir ${columna.label}`}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    )}
                    {columna.label}
                  </div>
                </th>
              );
            })}

            <th rowSpan={2} className={totalGeneralHeaderClass}>
              Total General
            </th>
          </tr>

          <tr>
            {columnasPrincipales.map((columna) => {
              const expandida = columnasExpandidas[columna.key];
              const tieneDetalle = columna.detalles.length > 0;

              if (!expandida || !tieneDetalle) return null;

              const esDetallado = columna.key === "total_detallado";

              return columna.detalles.map((detalle, detalleIndex) => (
                <th
                  key={`${columna.key}_${detalle.key}`}
                  className={getDetalleHeaderClass(
                    detalleIndex,
                    columna.detalles.length,
                    esDetallado
                  )}
                >
                  {detalle.label}
                </th>
              ));
            })}
          </tr>
        </thead>

        <tbody className="bg-white">
          {bloque.datos.map((registro) => (
            <tr
              key={registro.id}
              className="border-b border-slate-100 hover:bg-blue-50/40"
            >
              <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-3 py-2.5 text-center text-xs font-semibold text-slate-700 sm:px-4 sm:py-3 sm:text-sm">
                {getFechaCorta(registro.fecha)}
              </td>

              {columnasPrincipales.map((columna) => {
                const expandida = columnasExpandidas[columna.key];
                const tieneDetalle = columna.detalles.length > 0;

                if (expandida && tieneDetalle) {
                  const esDetallado = columna.key === "total_detallado";

                  return columna.detalles.map((detalle, detalleIndex) => (
                    <td
                      key={`${registro.id}_${detalle.key}`}
                      className={getDetalleCellClass(
                        detalleIndex,
                        columna.detalles.length,
                        false,
                        esDetallado
                      )}
                    >
                      {formatNumber(obtenerTotalDetalle(registro, detalle.key))}
                    </td>
                  ));
                }

                return (
                  <td
                    key={`${registro.id}_${columna.key}`}
                    className="border-b border-r border-slate-100 px-3 py-2.5 text-center text-xs text-slate-700 sm:px-4 sm:py-3 sm:text-sm"
                  >
                    {formatNumber(
                      obtenerTotalColumnaRegistro(registro, columna)
                    )}
                  </td>
                );
              })}

              <td className={totalGeneralCellClass}>
                {formatNumber(obtenerTotalFila(registro))}
              </td>
            </tr>
          ))}

          <tr className="font-bold">
            <td className="sticky left-0 z-10 border-r border-t-2 border-slate-500 bg-slate-600 px-3 py-2.5 text-center text-xs text-white sm:px-4 sm:py-3 sm:text-sm">
              <div className="flex flex-col items-center leading-tight">
                <span className="text-[11px] uppercase tracking-wide text-slate-200">
                  Total
                </span>
                <span>General</span>
              </div>
            </td>

            {columnasPrincipales.map((columna) => {
              const expandida = columnasExpandidas[columna.key];
              const tieneDetalle = columna.detalles.length > 0;

              if (expandida && tieneDetalle) {
                const esDetallado = columna.key === "total_detallado";

                return columna.detalles.map((detalle, detalleIndex) => (
                  <td
                    key={`total_${detalle.key}`}
                    className={getDetalleCellClass(
                      detalleIndex,
                      columna.detalles.length,
                      true,
                      esDetallado
                    )}
                  >
                    {formatNumber(
                      obtenerTotalDetalleColumna(bloque, detalle.key)
                    )}
                  </td>
                ));
              }

              return (
                <td
                  key={`total_${columna.key}`}
                  className="border-r border-t-2 border-slate-500 bg-slate-600 px-3 py-2.5 text-center text-xs font-extrabold text-white sm:px-4 sm:py-3 sm:text-sm"
                >
                  {formatNumber(obtenerTotalColumna(bloque, columna.key))}
                </td>
              );
            })}

            <td className={totalGeneralFooterCellClass}>
              {formatNumber(obtenerTotalGeneralBloque(bloque))}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TablaWipOperacionResumen;
