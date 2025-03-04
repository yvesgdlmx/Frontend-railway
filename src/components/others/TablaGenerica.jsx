import React from 'react';
const TablaGenerica = ({ columns, data }) => {
  return (
    <table className="min-w-full bg-white border rounded-lg shadow-lg text-sm">
      <thead>
        <tr className="bg-blue-600 text-white">
          {columns.map((col) => (
            <th
              key={col.accessor}
              className="py-3 px-5 text-left font-semibold border-l first:border-l-0"
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr
            key={index}
            className={`border-t border-gray-200 hover:bg-blue-100 ${
              index % 2 === 0 ? 'bg-white' : 'bg-blue-50'
            }`}
          >
            {columns.map((col) => (
              <td key={col.accessor} className="py-3 px-5 border text-gray-500">
                {row[col.accessor]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
export default TablaGenerica;