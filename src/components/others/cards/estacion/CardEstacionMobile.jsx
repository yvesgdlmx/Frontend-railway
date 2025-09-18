import React from "react";
import { Link } from "react-router-dom";
import { FaComment } from "react-icons/fa";
import { formatNumber } from "../../../../helpers/formatNumber";
const CardEstacionMobile = ({
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
  getMetaParaHora,  // Opcional: se pasará solo en secciones con meta (por ejemplo, biselado)
  getClassName,     // Opcional
  inicioJornada,
  label,
  linkRoute
}) => {
  // Determinar si se trabajan metas (si getMetaParaHora ha sido pasado como prop)
  const hasMeta = typeof getMetaParaHora === "function";
  return (
    <div className="block lg:hidden mt-4">
      <div className="bg-white shadow-md rounded-lg mb-4 p-6">
        <div className="flex justify-between border-b pb-2">
          <span className="font-bold text-gray-700">Nombre:</span>
          <span className="font-bold text-gray-700">{label}</span>
        </div>
        <div className="py-4">
          <span className="font-bold text-gray-700">Horas:</span>
          {columnas.map((col, i) => {
            const metaParaCol = hasMeta ? getMetaParaHora(col.hora, inicioJornada) : null;
            return (
              <div
                key={i}
                className={`flex justify-between py-2 px-4 ${
                  i % 2 === 0 ? "bg-slate-200" : "bg-slate-300"
                }`}
                title={
                  notas[col.hora] && notas[col.hora].nota
                    ? notas[col.hora].nota
                    : "Haz click para agregar un comentario"
                }
                onClick={() => toggleNota(col.hora)}
              >
                <span className="font-bold text-gray-700">{col.rango}:</span>
                <span
                  className={`font-bold ${
                    hasMeta && getClassName
                      ? getClassName(col.valor, metaParaCol)
                      : ""
                  }`}
                >
                  {col.valor}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center mt-4">
          <Link
            to={linkRoute}
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
          >
            <button className="text-white font-bold uppercase">
              Ver Detalles
            </button>
          </Link>
        </div>
        <div className="mt-6 border-t pt-4">
          <div className="bg-green-50 p-4 rounded-lg shadow-md">
            <h4 className="font-semibold text-green-700 mb-2">
              Totales por Turno
            </h4>
            <div className="grid grid-cols-1 gap-4">
              {/* Tarjeta para turno Nocturno */}
              <div
                className="relative bg-white p-2 rounded shadow cursor-pointer"
                onClick={() => toggleNotaTurno("nocturno")}
                title={
                  notasTurnos.nocturno && notasTurnos.nocturno.comentario
                    ? notasTurnos.nocturno.comentario
                    : "Haz click para agregar un comentario"
                }
              >
                <p className="text-gray-600 text-sm md:text-base">
                  <strong>Total Nocturno:</strong>{" "}
                  <span
                    className={
                      hasMeta && getClassName
                        ? getClassName(
                            totalesPorTurno.nocturno,
                            metasTotalesPorTurno && metasTotalesPorTurno.nocturno
                          )
                        : ""
                    }
                  >
                    {formatNumber(totalesPorTurno.nocturno)}
                  </span>{" "}
                  {notasTurnos.nocturno && notasTurnos.nocturno.comentario ? (
                    <FaComment size={12} className="inline ml-2 text-blue-500" />
                  ) : null}{" "}
                  {hasMeta && (
                    <>
                      / Meta Acumulada:{" "}
                      {formatNumber(
                        metasTotalesPorTurno ? metasTotalesPorTurno.nocturno : 0
                      )}{" "}
                      / Meta x Hora:{" "}
                      {metasPorHora ? metasPorHora.nocturno : ""}
                    </>
                  )}
                </p>
                {turnoActivo === "nocturno" && (
                  <div
                    className="absolute z-50 bg-gray-100 p-4 border rounded shadow-md w-64 h-24 text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <textarea
                      className="w-full h-12 p-1 border mb-2 text-xs"
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
              {/* Tarjeta para turno Matutino */}
              <div
                className="relative bg-white p-2 rounded shadow cursor-pointer"
                onClick={() => toggleNotaTurno("matutino")}
                title={
                  notasTurnos.matutino && notasTurnos.matutino.comentario
                    ? notasTurnos.matutino.comentario
                    : "Haz click para agregar un comentario"
                }
              >
                <p className="text-gray-600 text-sm md:text-base">
                  <strong>Total Matutino:</strong>{" "}
                  <span
                    className={
                      hasMeta && getClassName
                        ? getClassName(
                            totalesPorTurno.matutino,
                            metasTotalesPorTurno && metasTotalesPorTurno.matutino
                          )
                        : ""
                    }
                  >
                    {formatNumber(totalesPorTurno.matutino)}
                  </span>{" "}
                  {notasTurnos.matutino && notasTurnos.matutino.comentario ? (
                    <FaComment size={12} className="inline ml-2 text-blue-500" />
                  ) : null}{" "}
                  {hasMeta && (
                    <>
                      / Meta Acumulada:{" "}
                      {formatNumber(
                        metasTotalesPorTurno ? metasTotalesPorTurno.matutino : 0
                      )}{" "}
                      / Meta x Hora: {metasPorHora ? metasPorHora.matutino : ""}
                    </>
                  )}
                </p>
                {turnoActivo === "matutino" && (
                  <div
                    className="absolute z-50 bg-gray-100 p-4 border rounded shadow-md w-full sm:w-64 h-24 text-xs"
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
              {/* Tarjeta para turno Vespertino */}
              <div
                className="relative bg-white p-2 rounded shadow cursor-pointer"
                onClick={() => toggleNotaTurno("vespertino")}
                title={
                  notasTurnos.vespertino && notasTurnos.vespertino.comentario
                    ? notasTurnos.vespertino.comentario
                    : "Haz click para agregar un comentario"
                }
              >
                <p className="text-gray-600 text-sm md:text-base">
                  <strong>Total Vespertino:</strong>{" "}
                  <span
                    className={
                      hasMeta && getClassName
                        ? getClassName(
                            totalesPorTurno.vespertino,
                            metasTotalesPorTurno && metasTotalesPorTurno.vespertino
                          )
                        : ""
                    }
                  >
                    {formatNumber(totalesPorTurno.vespertino)}
                  </span>{" "}
                  {notasTurnos.vespertino && notasTurnos.vespertino.comentario ? (
                    <FaComment size={12} className="inline ml-2 text-blue-500" />
                  ) : null}{" "}
                  {hasMeta && (
                    <>
                      / Meta Acumulada:{" "}
                      {formatNumber(
                        metasTotalesPorTurno ? metasTotalesPorTurno.vespertino : 0
                      )}{" "}
                      / Meta x Hora: {metasPorHora ? metasPorHora.vespertino : ""}
                    </>
                  )}
                </p>
                {turnoActivo === "vespertino" && (
                  <div
                    className="absolute z-50 bg-gray-100 p-4 border rounded shadow-md w-full sm:w-64 h-24 text-xs bottom-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <textarea
                      className="w-full h-12 p-1 border mb-2 text-xs"
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
        </div>
      </div>
    </div>
  );
};
export default CardEstacionMobile;