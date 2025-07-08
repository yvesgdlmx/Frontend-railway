import React from "react";
import TablaSurtidoMaquinaMobile from "./TablaSurtidoMaquinaMobile";
// Función para determinar el turno según la hora
const getTurnWithTime = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  if (h >= 22 || h < 6) {
    return "meta_nocturno";
  }
  const totalMin = h * 60 + m;
  if (totalMin >= 390 && totalMin < 870) return "meta_matutino";
  return "meta_vespertino";
};
// Función auxiliar que retorna los totales por turno para cada registro
const getTotalsByTurn = (row, columns) => {
  const totals = {
    meta_nocturno: { hits: 0, meta: 0 },
    meta_matutino: { hits: 0, meta: 0 },
    meta_vespertino: { hits: 0, meta: 0 },
  };
  // Filtramos las columnas horarias
  const hourColumns = columns.filter((col) => col.accessor.startsWith("hour_"));
  hourColumns.forEach((col) => {
    const timeStr = col.accessor.replace("hour_", "");
    const turno = getTurnWithTime(timeStr);
    const hits = Number(row[col.accessor] || 0);
    totals[turno].hits += hits;
    // Se asume que row.metas contiene la meta correspondiente a cada turno
    const metaForColumn = row.metas ? Number(row.metas[turno] || 0) : 0;
    totals[turno].meta += metaForColumn;
  });
  return totals;
};
const TablaSurtidoMaquina = ({ columns, finalFilteredData, totalsRow }) => {
  // Calculamos los totales generales por turno de todos los registros
  const totalTurnos = finalFilteredData.reduce(
    (acc, row) => {
      const rowTotals = getTotalsByTurn(row, columns);
      for (let turno in rowTotals) {
        acc[turno].hits += rowTotals[turno].hits;
        acc[turno].meta += rowTotals[turno].meta;
      }
      return acc;
    },
    {
      meta_nocturno: { hits: 0, meta: 0 },
      meta_matutino: { hits: 0, meta: 0 },
      meta_vespertino: { hits: 0, meta: 0 },
    }
  );
  // Función para renderizar las celdas de turnos (no se modifica, son las columnas extras para nocturno, matutino y vespertino)
  const renderTurnosCells = (row) => {
    const rowTurnos = getTotalsByTurn(row, columns);
    return ["meta_nocturno", "meta_matutino", "meta_vespertino"].map((turno) => {
      const { hits, meta } = rowTurnos[turno];
      const valorColor = hits >= meta ? "text-green-700" : "text-red-700";
      return (
        <td key={turno} className="px-6 py-4 text-sm">
          <div className="font-bold">hits / meta</div>
          <div>
            <span className={valorColor}>{hits}</span> / {meta}
          </div>
        </td>
      );
    });
  };
  // Función para renderizar las celdas de totales generales de turnos (para nocturno, matutino y vespertino)
  const renderTotalTurnosCells = () =>
    ["meta_nocturno", "meta_matutino", "meta_vespertino"].map((turno) => {
      const { hits, meta } = totalTurnos[turno];
      const valorColor = hits >= meta ? "text-green-700" : "text-red-700";
      return (
        <td key={turno} className="px-6 py-4 text-sm border-b border-gray-200">
          <div className="font-bold">hits / meta</div>
          <div>
            <span className={valorColor}>{hits}</span> / {meta}
          </div>
        </td>
      );
    });
  return (
    <>
      {/* Vista de escritorio: se muestra a partir del breakpoint "lg" */}
      <div className="hidden lg:block">
        <div className="shadow-md w-max">
          <table className="table-fixed divide-y divide-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gradient-to-r from-blue-500 to-blue-600">
              <tr>
                {columns.map((col) => (
                  <React.Fragment key={col.accessor}>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      {col.header}
                    </th>
                    {col.accessor === "totalAcumulado" && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Nocturno
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Matutino
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Vespertino
                        </th>
                      </>
                    )}
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 font-semibold text-gray-500 text-center">
              {finalFilteredData.map((row, idx) => {
                return (
                  <tr
                    key={idx}
                    className={`transition-colors duration-200 hover:bg-blue-100 ${
                      idx % 2 === 0 ? "bg-blue-50" : "bg-white"
                    }`}
                  >
                    {columns.map((col) => {
                      let cell = null;
                      if (col.accessor.startsWith("hour_")) {
                        // Para las columnas de horas, mostramos solo hits y en el hover se muestra la meta
                        const timeStr = col.accessor.replace("hour_", "");
                        const turno = getTurnWithTime(timeStr);
                        const meta = row.metas ? Number(row.metas[turno] || 0) : 0;
                        const valor = Number(row[col.accessor] || 0);
                        const valorColor =
                          valor >= meta ? "text-green-700" : "text-red-700";
                        cell = (
                          <td
                            key={col.accessor}
                            className="px-6 py-4 text-sm"
                            title={`Meta del turno: ${meta}`}
                          >
                            <div>
                              <span className={valorColor}>{valor}</span>
                            </div>
                          </td>
                        );
                      } else if (col.accessor === "totalAcumulado") {
                        const valor = Number(row.totalAcumulado || 0);
                        const meta = Number(row.metaAcumulada || 0);
                        const valorColor =
                          valor >= meta ? "text-green-700" : "text-red-700";
                        cell = (
                          <td key={col.accessor} className="px-6 py-4 text-sm">
                            <div className="font-bold">hits / meta</div>
                            <div>
                              <span className={valorColor}>{valor}</span> / {meta}
                            </div>
                          </td>
                        );
                      } else {
                        cell = (
                          <td key={col.accessor} className="px-6 py-4 text-sm">
                            {row[col.accessor] !== undefined ? row[col.accessor] : "-"}
                          </td>
                        );
                      }
                      return (
                        <React.Fragment key={col.accessor}>
                          {cell}
                          {col.accessor === "totalAcumulado" && renderTurnosCells(row)}
                        </React.Fragment>
                      );
                    })}
                  </tr>
                );
              })}
              {/* Fila de totales generales */}
              <tr className="bg-blue-50 font-semibold">
                {columns.map((col) => {
                  let cell = null;
                  if (col.accessor === "totalAcumulado") {
                    const valor = Number(totalsRow.totalAcumulado || 0);
                    const metaTotal = finalFilteredData.reduce((acc, row) => {
                      const meta = Number(row.metaAcumulada || 0);
                      return acc + meta;
                    }, 0);
                    const valorColor =
                      valor >= metaTotal ? "text-green-700" : "text-red-700";
                    cell = (
                      <td
                        key={col.accessor}
                        className="px-6 py-4 text-sm border-b border-gray-200"
                      >
                        <div className="font-bold">hits / meta</div>
                        <div>
                          <span className={valorColor}>{valor}</span> / {metaTotal}
                        </div>
                      </td>
                    );
                  } else if (col.accessor.startsWith("hour_")) {
                    // Para las columnas de hora en la fila de totales: solo se muestran los hits y se agrega el title con la meta total
                    const timeStr = col.accessor.replace("hour_", "");
                    const turno = getTurnWithTime(timeStr);
                    const metaTotal = finalFilteredData.reduce((acc, row) => {
                      const meta = row.metas ? Number(row.metas[turno] || 0) : 0;
                      return acc + meta;
                    }, 0);
                    const valor = Number(totalsRow[col.accessor] || 0);
                    const valorColor =
                      valor >= metaTotal ? "text-green-700" : "text-red-700";
                    cell = (
                      <td
                        key={col.accessor}
                        className="px-6 py-4 text-sm border-b border-gray-200"
                        title={`Meta del turno: ${metaTotal}`}
                      >
                        <div>
                          <span className={valorColor}>{valor}</span>
                        </div>
                      </td>
                    );
                  } else {
                    cell = (
                      <td
                        key={col.accessor}
                        className="px-6 py-4 text-sm border-b border-gray-200"
                      >
                        {totalsRow[col.accessor] !== undefined ? totalsRow[col.accessor] : "-"}
                      </td>
                    );
                  }
                  return (
                    <React.Fragment key={col.accessor}>
                      {cell}
                      {col.accessor === "totalAcumulado" && renderTotalTurnosCells()}
                    </React.Fragment>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* Vista móvil y tablets: se muestra hasta el breakpoint "lg" */}
      <div className="block lg:hidden">
        <TablaSurtidoMaquinaMobile
          columns={columns}
          finalFilteredData={finalFilteredData}
          totalsRow={totalsRow}
        />
      </div>
    </>
  );
};
export default TablaSurtidoMaquina;