import React from "react";
import TablaSurtidoMaquinaMobile from "./TablaSurtidoMaquinaMobile";
const getTurnWithTime = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  if (h >= 22 || h < 6) {
    return "meta_nocturno";
  }
  const totalMin = h * 60 + m;
  if (totalMin >= 390 && totalMin < 870) return "meta_matutino";
  return "meta_vespertino";
};
const TablaSurtidoMaquina = ({ columns, finalFilteredData, totalsRow }) => {
  return (
    <>
      {/* Vista de escritorio: se muestra a partir del breakpoint "lg" */}
      <div className="hidden lg:block overflow-x-auto">
        <div className="shadow-md w-max">
          <table className="table-fixed divide-y divide-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gradient-to-r from-blue-500 to-blue-600">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.accessor}
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 font-semibold text-gray-500">
              {finalFilteredData.map((row, idx) => (
                <tr
                  key={idx}
                  className={`transition-colors duration-200 hover:bg-blue-100 ${
                    idx % 2 === 0 ? "bg-blue-50" : "bg-white"
                  }`}
                >
                  {columns.map((col) => {
                    if (col.accessor.startsWith("hour_")) {
                      const timeStr = col.accessor.replace("hour_", "");
                      const turno = getTurnWithTime(timeStr);
                      const meta = row.metas ? Number(row.metas[turno] || 0) : 0;
                      const valor = Number(row[col.accessor] || 0);
                      const valorColor =
                        valor >= meta ? "text-green-700" : "text-red-700";
                      return (
                        <td key={col.accessor} className="px-6 py-4 text-sm">
                          <div className="font-bold">hits / meta</div>
                          <div>
                            <span className={valorColor}>{valor}</span> / {meta}
                          </div>
                        </td>
                      );
                    } else if (col.accessor === "totalAcumulado") {
                      const valor = Number(row.totalAcumulado || 0);
                      const meta = Number(row.metaAcumulada || 0);
                      const valorColor =
                        valor >= meta ? "text-green-700" : "text-red-700";
                      return (
                        <td key={col.accessor} className="px-6 py-4 text-sm">
                          <div className="font-bold">hits / meta</div>
                          <div>
                            <span className={valorColor}>{valor}</span> / {meta}
                          </div>
                        </td>
                      );
                    }
                    return (
                      <td key={col.accessor} className="px-6 py-4 text-sm">
                        {row[col.accessor] !== undefined
                          ? row[col.accessor]
                          : col.accessor.startsWith("hour_")
                          ? 0
                          : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="bg-blue-50 font-semibold">
                {columns.map((col) => {
                  if (col.accessor === "totalAcumulado") {
                    const valor = Number(totalsRow.totalAcumulado || 0);
                    const metaTotal = finalFilteredData.reduce((acc, row) => {
                      const meta = Number(row.metaAcumulada || 0);
                      return acc + meta;
                    }, 0);
                    const valorColor =
                      valor >= metaTotal ? "text-green-700" : "text-red-700";
                    return (
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
                    const timeStr = col.accessor.replace("hour_", "");
                    const turno = getTurnWithTime(timeStr);
                    const metaTotal = finalFilteredData.reduce((acc, row) => {
                      const meta = row.metas ? Number(row.metas[turno] || 0) : 0;
                      return acc + meta;
                    }, 0);
                    const valor = Number(totalsRow[col.accessor] || 0);
                    const valorColor =
                      valor >= metaTotal ? "text-green-700" : "text-red-700";
                    return (
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
                  } else {
                    return (
                      <td
                        key={col.accessor}
                        className="px-6 py-4 text-sm border-b border-gray-200"
                      >
                        {totalsRow[col.accessor] !== undefined
                          ? totalsRow[col.accessor]
                          : "-"}
                      </td>
                    );
                  }
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