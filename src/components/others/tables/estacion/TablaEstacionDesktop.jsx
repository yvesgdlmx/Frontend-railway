import React from "react";
import { Link } from "react-router-dom";
import { FaComment } from "react-icons/fa";
import { formatNumber } from "../../../../helpers/formatNumber";
const TablaEstacionDesktop = ({
  columnas,
  totalesPorTurno,
  metasPorHora,
  metasTotalesPorTurno,
  notas,
  notaActiva,
  editingNota,
  setEditingNota,
  toggleNota,
  handleGuardarNota,
  handleEditarNota,
  toggleNotaTurno,
  notasTurnos,
  turnoActivo,
  editingTurnoNota,
  setEditingTurnoNota,
  handleGuardarNotaTurno,
  handleEditarNotaTurno,
  getMetaParaHora,  // Opcional para secciones con meta
  getClassName,     // Opcional
  inicioJornada,
  label,
  linkRoute
}) => {
  // Detecta si se pasaron funciones para trabajar con metas
  const hasMeta = typeof getMetaParaHora === "function";
  return (
    <div className="hidden lg:block" id="surtido">
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-blue-500 text-white border-l-2">
            <th className="py-3 px-4 min-w-[150px] whitespace-nowrap text-sm md:text-base"></th>
            {columnas.map((col, i) => (
              <th
                key={i}
                className="py-3 px-4 border-b min-w-[150px] whitespace-nowrap text-sm md:text-base"
              >
                {col.rango}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-center bg-white">
          <tr className="font-semibold text-gray-700">
            <td className="py-3">
              <Link to={linkRoute} className="link__tabla">
                <div className="flex items-center justify-center hover:scale-105 transition-transform duration-300 px-4">
                  <img
                    src="./img/ver.png"
                    alt="Ver"
                    width={25}
                    className="relative left-2"
                  />
                  <div className="py-3 px-4 min-w-[150px] whitespace-nowrap text-sm md:text-base">
                    {label}
                  </div>
                </div>
              </Link>
            </td>
            {columnas.map((col, i) => {
              const metaParaCol = hasMeta ? getMetaParaHora(col.hora, inicioJornada) : null;
              return (
                <td
                  key={i}
                  title={
                    notas[col.hora] && notas[col.hora].nota
                      ? notas[col.hora].nota
                      : "Haz click para agregar un comentario"
                  }
                  className="py-3 px-4 border-b font-bold border-l-2 border-gray-200 min-w-[150px] whitespace-nowrap text-sm md:text-base bg-white relative cursor-pointer"
                  onClick={() => toggleNota(col.hora)}
                >
                  <span className={hasMeta && getClassName ? getClassName(col.valor, metaParaCol) : ""}>
                    {col.valor}
                  </span>
                  {notaActiva === col.hora && (
                    <div
                      className="absolute top-[-10px] left-0 z-50 bg-gray-100 p-4 border rounded shadow-md w-64 h-24 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <textarea
                        className="w-full h-16 p-1 border mb-2 text-xs"
                        value={editingNota}
                        onChange={(e) => setEditingNota(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          disabled={!!notas[col.hora]?.nota}
                          className={`py-1 px-3 rounded text-xs ${
                            notas[col.hora]?.nota
                              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                              : "bg-green-500 text-white hover:bg-green-600"
                          }`}
                          onClick={(e) => {
                            if (!notas[col.hora]?.nota) {
                              e.stopPropagation();
                              handleGuardarNota(col.hora);
                            }
                          }}
                        >
                          Guardar
                        </button>
                        <button
                          className="bg-blue-500 text-white py-1 px-3 rounded text-xs hover:bg-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditarNota(col.hora);
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingNota("");
                            toggleNota(col.hora);
                          }}
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
      {/* Sección de totales por turno */}
      <div className="flex flex-row justify-around mt-4 font-semibold mb-4 gap-6">
        {/* Tarjeta para Total Nocturno */}
        <div
          className="bg-white p-2 px-10 rounded-lg shadow-md flex items-center relative cursor-pointer"
          title={
            notasTurnos.nocturno && notasTurnos.nocturno.comentario
              ? notasTurnos.nocturno.comentario
              : "Haz click para agregar un comentario"
          }
          onClick={() => toggleNotaTurno("nocturno")}
        >
          <p className="text-gray-600 text-sm md:text-base">
            Total Nocturno:{" "}
            <span className={hasMeta && getClassName ? getClassName(totalesPorTurno.nocturno, metasTotalesPorTurno ? metasTotalesPorTurno.nocturno : 0) : ""}>
              {formatNumber(totalesPorTurno.nocturno)}
            </span>{" "}
            {notasTurnos.nocturno && notasTurnos.nocturno.comentario ? (
              <FaComment size={12} className="inline ml-2 text-blue-500" />
            ) : null}{" "}
            {hasMeta && (
              <> / Meta Acumulada: {formatNumber(metasTotalesPorTurno ? metasTotalesPorTurno.nocturno : 0)} / Meta x Hora: {metasPorHora ? metasPorHora.nocturno : ""}</>
            )}
          </p>
          {turnoActivo === "nocturno" && (
            <div
              className="absolute top-[-55px] left-0 z-50 bg-gray-100 p-4 border rounded shadow-md w-64 h-24 text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <textarea
                className="w-full h-16 p-1 border mb-2 text-xs"
                value={editingTurnoNota}
                onChange={(e) => setEditingTurnoNota(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex justify-end space-x-2">
                {notasTurnos.nocturno ? (
                  <button
                    className="bg-blue-500 text-white py-1 px-3 rounded text-xs hover:bg-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditarNotaTurno("nocturno");
                    }}
                  >
                    Guardar Cambios
                  </button>
                ) : (
                  <button
                    className="bg-green-500 text-white py-1 px-3 rounded text-xs hover:bg-green-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGuardarNotaTurno("nocturno");
                    }}
                  >
                    Guardar
                  </button>
                )}
                <button
                  className="bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingTurnoNota("");
                    toggleNotaTurno("nocturno");
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Tarjeta para Total Matutino */}
        <div
          className="bg-white p-2 px-10 rounded-lg shadow-md flex items-center relative cursor-pointer"
          title={
            notasTurnos.matutino && notasTurnos.matutino.comentario
              ? notasTurnos.matutino.comentario
              : "Haz click para agregar un comentario"
          }
          onClick={() => toggleNotaTurno("matutino")}
        >
          <p className="text-gray-600 text-sm md:text-base">
            Total Matutino:{" "}
            <span className={hasMeta && getClassName ? getClassName(totalesPorTurno.matutino, metasTotalesPorTurno ? metasTotalesPorTurno.matutino : 0) : ""}>
              {formatNumber(totalesPorTurno.matutino)}
            </span>{" "}
            {notasTurnos.matutino && notasTurnos.matutino.comentario ? (
              <FaComment size={12} className="inline ml-2 text-blue-500" />
            ) : null}{" "}
            {hasMeta && (
              <> / Meta Acumulada: {formatNumber(metasTotalesPorTurno ? metasTotalesPorTurno.matutino : 0)} / Meta x Hora: {metasPorHora ? metasPorHora.matutino : ""}</>
            )}
          </p>
          {turnoActivo === "matutino" && (
            <div
              className="absolute top-[-55px] left-0 z-50 bg-gray-100 p-4 border rounded shadow-md w-64 h-24 text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <textarea
                className="w-full h-12 p-1 border mb-2 text-xs"
                value={editingTurnoNota}
                onChange={(e) => setEditingTurnoNota(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex justify-end space-x-2">
                {notasTurnos.matutino ? (
                  <button
                    className="bg-blue-500 text-white py-1 px-3 rounded text-xs hover:bg-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditarNotaTurno("matutino");
                    }}
                  >
                    Guardar Cambios
                  </button>
                ) : (
                  <button
                    className="bg-green-500 text-white py-1 px-3 rounded text-xs hover:bg-green-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGuardarNotaTurno("matutino");
                    }}
                  >
                    Guardar
                  </button>
                )}
                <button
                  className="bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingTurnoNota("");
                    toggleNotaTurno("matutino");
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Tarjeta para Total Vespertino */}
        <div
          className="bg-white p-2 px-10 rounded-lg shadow-md flex items-center relative cursor-pointer"
          title={
            notasTurnos.vespertino && notasTurnos.vespertino.comentario
              ? notasTurnos.vespertino.comentario
              : "Haz click para agregar un comentario"
          }
          onClick={() => toggleNotaTurno("vespertino")}
        >
          <p className="text-gray-600 text-sm md:text-base">
            Total Vespertino:{" "}
            <span className={hasMeta && getClassName ? getClassName(totalesPorTurno.vespertino, metasTotalesPorTurno ? metasTotalesPorTurno.vespertino : 0) : ""}>
              {formatNumber(totalesPorTurno.vespertino)}
            </span>{" "}
            {notasTurnos.vespertino && notasTurnos.vespertino.comentario ? (
              <FaComment size={12} className="inline ml-2 text-blue-500" />
            ) : null}{" "}
            {hasMeta && (
              <> / Meta Acumulada: {formatNumber(metasTotalesPorTurno ? metasTotalesPorTurno.vespertino : 0)} / Meta x Hora: {metasPorHora ? metasPorHora.vespertino : ""}</>
            )}
          </p>
          {turnoActivo === "vespertino" && (
            <div
              className="absolute top-[-55px] left-0 z-50 bg-gray-100 p-4 border rounded shadow-md w-64 h-24 text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <textarea
                className="w-full h-16 p-1 border mb-2 text-xs"
                value={editingTurnoNota}
                onChange={(e) => setEditingTurnoNota(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex justify-end space-x-2">
                {notasTurnos.vespertino ? (
                  <button
                    className="bg-blue-500 text-white py-1 px-3 rounded text-xs hover:bg-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditarNotaTurno("vespertino");
                    }}
                  >
                    Guardar Cambios
                  </button>
                ) : (
                  <button
                    className="bg-green-500 text-white py-1 px-3 rounded text-xs hover:bg-green-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGuardarNotaTurno("vespertino");
                    }}
                  >
                    Guardar
                  </button>
                )}
                <button
                  className="bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingTurnoNota("");
                    toggleNotaTurno("vespertino");
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default TablaEstacionDesktop;