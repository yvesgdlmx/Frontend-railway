import React from "react";
const TablaMetas = ({ metas, handleInputChange }) => {
  return (
    <table className="w-full table-auto">
      <thead>
        <tr className="bg-blue-500 text-white text-sm">
          <th className="px-2 py-1 border">Nombre</th>
          <th className="px-2 py-1 border">Metas</th>
        </tr>
      </thead>
      <tbody>
        {metas.map((meta) => (
          <tr key={meta.id} className="text-sm">
            <td className="px-2 py-1 border">{meta.name}</td>
            <td className="px-2 py-1 border">
              <div className="flex flex-col items-center">
                <div className="flex space-x-2 text-xs text-gray-500">
                  <span>Noct.</span>
                  <span>Mat.</span>
                  <span>Vesp.</span>
                </div>
                <div className="flex space-x-2 mt-1">
                  <input
                    type="number"
                    value={meta.meta_nocturno ?? ""}
                    onChange={(e) =>
                      handleInputChange(e, meta.id, "meta_nocturno")
                    }
                    className="appearance-none w-14 px-1 py-0.5 border rounded text-center"
                  />
                  <input
                    type="number"
                    value={meta.meta_matutino ?? ""}
                    onChange={(e) =>
                      handleInputChange(e, meta.id, "meta_matutino")
                    }
                    className="appearance-none w-14 px-1 py-0.5 border rounded text-center"
                  />
                  <input
                    type="number"
                    value={meta.meta_vespertino ?? ""}
                    onChange={(e) =>
                      handleInputChange(e, meta.id, "meta_vespertino")
                    }
                    className="appearance-none w-14 px-1 py-0.5 border rounded text-center"
                  />
                </div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
export default TablaMetas;