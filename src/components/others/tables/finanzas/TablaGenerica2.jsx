import React from "react";
const TablaGenerica2 = ({ columns, data, totalesRow }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border rounded-lg shadow-lg text-sm">
        <thead>
          <tr className="bg-blue-600 text-white">
            {columns.map((col) => (
              <th
                key={col.accessor}
                className="py-3 px-5 text-left font-semibold border-l first:border-l-0 whitespace-nowrap"
                style={{ minWidth: "150px" }}
              >
                <div>{col.header}</div>
                {col.subHeader && (
                  <div className="text-xs font-normal">{col.subHeader}</div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              className={`border-t border-gray-200 hover:bg-blue-100 ${
                index % 2 === 0 ? "bg-white" : "bg-blue-50"
              }`}
            >
              {columns.map((col) => (
                <td
                  key={col.accessor}
                  className="py-3 px-5 border text-gray-500 whitespace-nowrap"
                  style={{ minWidth: "150px" }}
                >
                  {row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
          {totalesRow && (
            <tr className="font-bold bg-green-100 border-t">
              {columns.map((col) => (
                <td
                  key={col.accessor}
                  className="py-3 px-5 border text-gray-500 whitespace-nowrap"
                  style={{ minWidth: "150px" }}
                >
                  {totalesRow[col.accessor] ?? ""}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
export default TablaGenerica2;