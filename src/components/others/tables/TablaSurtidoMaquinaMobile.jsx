import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
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
// Componente que renderiza un card colapsable (accordion) para cada registro
const CardMobile = ({ row, columns, idx }) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);
  // Actualiza la altura de la sección colapsable cuando cambia isOpen
  useEffect(() => {
    if (isOpen) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen]);
  // Filtramos las columnas horarias (excluyendo "nombre" y "totalAcumulado")
  const hourColumns = columns.filter(
    (col) =>
      col.accessor !== "nombre" && col.accessor !== "totalAcumulado"
  );
  // Calculamos los totales por turno para esta fila
  const totalsByTurn = {
    meta_nocturno: { hits: 0, meta: 0 },
    meta_matutino: { hits: 0, meta: 0 },
    meta_vespertino: { hits: 0, meta: 0 },
  };
  hourColumns.forEach((col) => {
    if (col.accessor.startsWith("hour_")) {
      const timeStr = col.accessor.replace("hour_", "");
      const turno = getTurnWithTime(timeStr);
      const hits = Number(row[col.accessor] || 0);
      totalsByTurn[turno].hits += hits;
      // Se suma la meta para cada columna del turno (se asume que row.metas contiene la meta por cada hora)
      const metaForColumn = row.metas ? Number(row.metas[turno] || 0) : 0;
      totalsByTurn[turno].meta += metaForColumn;
    }
  });
  // Función auxiliar para definir el color según los valores
  const getClassName = (hits, meta) =>
    hits >= meta ? "text-green-600" : "text-red-600";
  return (
    <div className="mb-8">
      <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
        {/* Header clickable para desplegar/contraer el card */}
        <div
          className="flex justify-between items-center bg-blue-500 text-white p-3 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <h3 className="text-lg font-semibold">
            {row.nombre || `Registro #${idx + 1}`}
          </h3>
          {isOpen ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
        </div>
        {/* Contenido colapsable (toda la información interna del card) */}
        <div
          ref={contentRef}
          style={{ maxHeight: `${height}px` }}
          className="transition-all duration-300 ease-in-out overflow-hidden"
        >
          <div className="p-4 space-y-4">
            {/* Grid para las columnas horarias */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {hourColumns
                // Creamos una copia del array y lo invertimos para que el turno nocturno aparezca primero
                .slice()
                .reverse()
                .map((col) => {
                  let label = col.header;
                  let content = null;
                  if (col.accessor.startsWith("hour_")) {
                    const timeStr = col.accessor.replace("hour_", "");
                    const turno = getTurnWithTime(timeStr);
                    const meta = row.metas ? Number(row.metas[turno] || 0) : 0;
                    const valor = Number(row[col.accessor] || 0);
                    const valorClass =
                      valor >= meta ? "text-green-600" : "text-red-600";
                    content = (
                      <>
                        <span className="text-gray-600">{label}:</span>
                        <span>
                          <span className={`font-semibold ${valorClass}`}>
                            {valor}
                          </span>
                          <span className="text-gray-600"> / {meta}</span>
                        </span>
                      </>
                    );
                  } else {
                    content = (
                      <>
                        <span className="text-gray-600">{label}:</span>
                        <span className="font-medium text-gray-800">
                          {row[col.accessor] !== undefined ? row[col.accessor] : "-"}
                        </span>
                      </>
                    );
                  }
                  return (
                    <div
                      key={col.accessor}
                      className="flex justify-between items-center p-2 border border-gray-200 rounded text-xs md:text-sm"
                    >
                      {content}
                    </div>
                  );
                })}
            </div>
            {/* Campo "totalAcumulado" se muestra de forma individual */}
            {columns
              .filter((col) => col.accessor === "totalAcumulado")
              .map((col) => {
                let label = col.header;
                let content = null;
                const valor = Number(row.totalAcumulado || 0);
                const meta = Number(row.metaAcumulada || 0);
                const valorClass =
                  valor >= meta ? "text-green-600" : "text-red-600";
                content = (
                  <>
                    <span className="text-gray-600">{label}:</span>
                    <span>
                      <span className={`font-semibold ${valorClass}`}>
                        {valor}
                      </span>
                      <span className="text-gray-600"> / {meta}</span>
                    </span>
                  </>
                );
                return (
                  <div
                    key={col.accessor}
                    className="flex justify-between items-center border-b border-gray-200 pb-2 last:border-0 text-xs md:text-sm"
                  >
                    {content}
                  </div>
                );
              })}
            {/* Sección de Turnos con estilo similar al CardHistorial */}
            <div className="bg-green-50 p-4">
              <h4 className="font-semibold text-green-700 mb-2">Turnos</h4>
              <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                <div className="text-center">
                  <span className="block text-gray-600">Nocturno</span>
                  <span
                    className={`font-bold ${getClassName(
                      totalsByTurn.meta_nocturno.hits,
                      totalsByTurn.meta_nocturno.meta
                    )}`}
                  >
                    {totalsByTurn.meta_nocturno.hits}
                  </span>
                  <span className="block text-xs text-gray-500">
                    Meta: {totalsByTurn.meta_nocturno.meta}
                  </span>
                </div>
                <div className="text-center">
                  <span className="block text-gray-600">Matutino</span>
                  <span
                    className={`font-bold ${getClassName(
                      totalsByTurn.meta_matutino.hits,
                      totalsByTurn.meta_matutino.meta
                    )}`}
                  >
                    {totalsByTurn.meta_matutino.hits}
                  </span>
                  <span className="block text-xs text-gray-500">
                    Meta: {totalsByTurn.meta_matutino.meta}
                  </span>
                </div>
                <div className="text-center">
                  <span className="block text-gray-600">Vespertino</span>
                  <span
                    className={`font-bold ${getClassName(
                      totalsByTurn.meta_vespertino.hits,
                      totalsByTurn.meta_vespertino.meta
                    )}`}
                  >
                    {totalsByTurn.meta_vespertino.hits}
                  </span>
                  <span className="block text-xs text-gray-500">
                    Meta: {totalsByTurn.meta_vespertino.meta}
                  </span>
                </div>
              </div>
            </div>
            {/* Fin de la sección de Turnos */}
          </div>
        </div>
      </div>
    </div>
  );
};
const TablaSurtidoMaquinaMobile = ({ columns, finalFilteredData }) => {
  return (
    <div>
      {finalFilteredData.map((row, idx) => (
        <CardMobile key={idx} row={row} columns={columns} idx={idx} />
      ))}
    </div>
  );
};
export default TablaSurtidoMaquinaMobile;