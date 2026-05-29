import React, { useEffect, useState } from "react";
import clienteAxios from "../../../config/clienteAxios";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Heading from "../../components/others/Heading";
import Actualizacion from "../../components/others/Actualizacion";
import SelectWipDiario from "../../components/others/html_personalizado/SelectWipDiario";
import TablaWipOperacionResumen from "../../components/others/tables/TablaWipOperacionResumen";
import formatearHora from "../../../helpers/formatearHora";

const ReporteWipOperacionResumen = () => {
  const [datosAPI, setDatosAPI] = useState([]);
  const [expandidos, setExpandidos] = useState({});
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [dia, setDia] = useState(new Date().getDate());

  const [clienteFiltro, setClienteFiltro] = useState("todos");
  const [lenspickFiltro, setLenspickFiltro] = useState("todos");
  const [coatingFiltro, setCoatingFiltro] = useState("todos");

  const clientes = ["nvi", "ink"];
  const coatings = ["clr", "cot", "par", "other"];
  const lenspicks = ["f", "s"];

  const columnasPrincipales = [
    {
      key: "total_sin_surtir",
      label: "Sin Surtir",
      detalles: [{ key: "sin_surtir", label: "Sin Surtir" }],
    },
    {
      key: "total_surtido",
      label: "Surtido",
      detalles: [{ key: "surtido", label: "Surtido" }],
    },
    {
      key: "total_tallado",
      label: "Tallado",
      detalles: [
        { key: "auditoria_tallado", label: "Auditoría" },
        { key: "bloqueo_tallado", label: "Bloqueo Tallado" },
        { key: "desblocking", label: "Desblocking" },
        { key: "engraver", label: "Engraver" },
        { key: "generado", label: "Generado" },
        { key: "pulido", label: "Pulido" },
      ],
    },
    {
      key: "total_en_ar",
      label: "En AR",
      detalles: [
        { key: "campana", label: "Campana" },
        { key: "hc", label: "HC" },
        { key: "rxvalidar", label: "RX Validar" },
        { key: "ar_entrada", label: "AR Entrada" },
      ],
    },
    {
      key: "total_terminado",
      label: "Terminado",
      detalles: [
        { key: "auditoria_terminado", label: "Auditoría" },
        { key: "biselado_automatico", label: "Biselado Automático" },
        { key: "biselado_manual", label: "Biselado Manual" },
        { key: "inspeccion", label: "Inspección" },
        { key: "tinte", label: "Tinte" },
        { key: "salida_hc", label: "Salida HC" },
        { key: "salida_ar", label: "Salida AR" },
      ],
    },
    {
      key: "total_merma",
      label: "Merma",
      detalles: [
        { key: "breakage", label: "Breakage" },
        { key: "bkg_wh_in", label: "BKG WH IN" },
      ],
    },
    {
      key: "total_recalculando",
      label: "Recalculando",
      detalles: [{ key: "digital_calc", label: "Digital Calc" }],
    },
    {
      key: "total_detallado",
      label: "Detallado",
      detalles: [{ key: "detallado", label: "Detallado" }],
    },
  ];

  const clienteOptions = [
    { value: "todos", label: "Todos los clientes" },
    { value: "nvi", label: "NVI" },
    { value: "ink", label: "INK" },
  ];

  const lenspickOptions = [
    { value: "todos", label: "Todos" },
    { value: "f", label: "F" },
    { value: "s", label: "S" },
  ];

  const coatingOptions = [
    { value: "todos", label: "Todas las capas" },
    { value: "clr", label: "CLR" },
    { value: "cot", label: "COT" },
    { value: "par", label: "PAR" },
    { value: "other", label: "OTHER" },
  ];

  const getClientesFiltrados = () => {
    return clienteFiltro === "todos" ? clientes : [clienteFiltro];
  };

  const getCoatingsFiltrados = () => {
    return coatingFiltro === "todos" ? coatings : [coatingFiltro];
  };

  const getLenspicksFiltrados = () => {
    return lenspickFiltro === "todos" ? lenspicks : [lenspickFiltro];
  };

  const formatNumber = (number) => {
    const value = Number(number) || 0;
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  useEffect(() => {
    const obtenerDatos = async () => {
      setDatosAPI([]);

      try {
        const response = await clienteAxios.get(
          `/reportes/wip_operacion_resumen/resumen/${anio}/${mes}/${dia}`
        );

        if (!response.data.registros || response.data.registros.length === 0) {
          setDatosAPI([]);
          return;
        }

        const datosAgrupados = agruparPorHora(response.data.registros);
        datosAgrupados.sort((a, b) => b.hora.localeCompare(a.hora));
        setDatosAPI(datosAgrupados);
      } catch (error) {
        console.error("Error al obtener WIP Operación Resumen:", error);
        setDatosAPI([]);
      }
    };

    obtenerDatos();
  }, [anio, mes, dia]);

  const agruparPorHora = (registros) => {
    const datosPorHora = registros.reduce((acc, item) => {
      const hora = item.hora_insercion;

      if (!acc[hora]) {
        acc[hora] = [];
      }

      acc[hora].push(item);
      return acc;
    }, {});

    return Object.keys(datosPorHora).map((hora) => ({
      hora,
      datos: datosPorHora[hora],
    }));
  };

  const toggleExpansion = (hora) => {
    setExpandidos((prev) => ({
      ...prev,
      [hora]: !prev[hora],
    }));
  };

  const obtenerTotalDetalle = (registro, detalleKey) => {
    return getClientesFiltrados().reduce((accCliente, cliente) => {
      return (
        accCliente +
        getCoatingsFiltrados().reduce((accCoating, coating) => {
          return (
            accCoating +
            getLenspicksFiltrados().reduce((accLenspick, lenspick) => {
              const key = `${cliente}_detalle_${detalleKey}_${coating}_${lenspick}`;
              return accLenspick + (Number(registro[key]) || 0);
            }, 0)
          );
        }, 0)
      );
    }, 0);
  };

  const obtenerTotalColumnaRegistro = (registro, columna) => {
    return columna.detalles.reduce((acc, detalle) => {
      return acc + obtenerTotalDetalle(registro, detalle.key);
    }, 0);
  };

  const obtenerTotalFila = (registro) => {
    return columnasPrincipales.reduce((acc, columna) => {
      return acc + obtenerTotalColumnaRegistro(registro, columna);
    }, 0);
  };

  const obtenerTotalColumna = (bloque, columnaKey) => {
    const columna = columnasPrincipales.find((col) => col.key === columnaKey);

    if (!columna) return 0;

    return bloque.datos.reduce((acc, registro) => {
      return acc + obtenerTotalColumnaRegistro(registro, columna);
    }, 0);
  };

  const obtenerTotalDetalleColumna = (bloque, detalleKey) => {
    return bloque.datos.reduce((acc, registro) => {
      return acc + obtenerTotalDetalle(registro, detalleKey);
    }, 0);
  };

  const obtenerTotalGeneralBloque = (bloque) => {
    return bloque.datos.reduce((acc, registro) => {
      return acc + obtenerTotalFila(registro);
    }, 0);
  };

  const getFechaCorta = (fecha) => {
    const date = new Date(`${fecha}T00:00:00`);
    return format(date, "dd-MMM", { locale: es }).replace(".", "");
  };

  const fechaFormateada = format(
    new Date(anio, mes - 1, dia),
    "EEEE d 'de' MMMM 'del' yyyy",
    { locale: es }
  );

  const fechaCapitalizada =
    fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);

  const anioOptions = Array.from({ length: 3 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year, label: year.toString() };
  });

  const mesOptions = Array.from({ length: 12 }, (_, i) => {
    const currentMes = i + 1;
    return { value: currentMes, label: currentMes.toString() };
  });

  const diaOptions = Array.from({ length: 31 }, (_, i) => {
    const currentDia = i + 1;
    return { value: currentDia, label: currentDia.toString() };
  });

  return (
    <>
      <div className="mt-4 md:mt-0">
        <Heading title="Reporte WIP Operación Resumen" />
      </div>

      <Actualizacion />

      <div className="min-h-screen bg-gray-50">
        <div className="px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto mt-4 grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <div className="w-full">
              <SelectWipDiario
                options={anioOptions}
                value={anioOptions.find((option) => option.value === anio)}
                onChange={(option) => setAnio(option.value)}
                placeholder="Año"
              />
            </div>

            <div className="w-full">
              <SelectWipDiario
                options={mesOptions}
                value={mesOptions.find((option) => option.value === mes)}
                onChange={(option) => setMes(option.value)}
                placeholder="Mes"
              />
            </div>

            <div className="w-full">
              <SelectWipDiario
                options={diaOptions}
                value={diaOptions.find((option) => option.value === dia)}
                onChange={(option) => setDia(option.value)}
                placeholder="Día"
              />
            </div>
          </div>

          {datosAPI.length === 0 ? (
            <div className="mx-auto mt-8 text-center text-xl font-semibold text-red-600">
              No hay registros disponibles para la fecha {fechaCapitalizada}
            </div>
          ) : (
            <div className="mx-auto mt-6 space-y-5 sm:mt-8 sm:space-y-6">
              {datosAPI.map((bloque) => (
                <div
                  key={bloque.hora}
                  className="overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-lg sm:rounded-xl"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 sm:px-6">
                    <span className="block text-sm font-medium text-white sm:text-lg">
                      {fechaCapitalizada}
                    </span>
                  </div>

                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:gap-6">
                      <div className="flex flex-col gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-xl font-bold leading-snug text-gray-500 sm:text-2xl">
                          WIP Operación Resumen - {formatearHora(bloque.hora)}
                        </h3>

                        <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">
                          <div className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2 text-white shadow-md sm:px-4">
                            <span className="whitespace-nowrap text-sm font-semibold sm:text-base">
                              {formatearHora(bloque.hora)} hrs
                            </span>
                          </div>

                          <button
                            onClick={() => toggleExpansion(bloque.hora)}
                            className="shrink-0 rounded-full p-2 text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700"
                            title={
                              expandidos[bloque.hora]
                                ? "Ocultar tabla"
                                : "Mostrar tabla"
                            }
                            aria-label={
                              expandidos[bloque.hora]
                                ? "Ocultar tabla"
                                : "Mostrar tabla"
                            }
                          >
                            {expandidos[bloque.hora] ? (
                              <ChevronUpIcon className="h-6 w-6" />
                            ) : (
                              <ChevronDownIcon className="h-6 w-6" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                        <div className="mb-3 flex flex-col gap-1 border-b border-slate-100 pb-3 sm:flex-row sm:items-end sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-700">
                              Filtros del resumen
                            </p>
                            <p className="text-xs text-slate-500">
                              Ajusta los totales por cliente, tipo F/S y capa.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div className="min-w-0">
                            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
                              Cliente
                            </label>
                            <SelectWipDiario
                              options={clienteOptions}
                              value={clienteOptions.find(
                                (option) => option.value === clienteFiltro
                              )}
                              onChange={(option) =>
                                setClienteFiltro(option.value)
                              }
                              placeholder="Selecciona cliente"
                            />
                          </div>

                          <div className="min-w-0">
                            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
                              F/S
                            </label>
                            <SelectWipDiario
                              options={lenspickOptions}
                              value={lenspickOptions.find(
                                (option) => option.value === lenspickFiltro
                              )}
                              onChange={(option) =>
                                setLenspickFiltro(option.value)
                              }
                              placeholder="Selecciona F/S"
                            />
                          </div>

                          <div className="min-w-0">
                            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
                              Capa
                            </label>
                            <SelectWipDiario
                              options={coatingOptions}
                              value={coatingOptions.find(
                                (option) => option.value === coatingFiltro
                              )}
                              onChange={(option) =>
                                setCoatingFiltro(option.value)
                              }
                              placeholder="Selecciona capa"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5 xl:grid-cols-9">
                        {columnasPrincipales.map((columna) => (
                          <div
                            key={`${bloque.hora}_${columna.key}_resumen`}
                            className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-3 transition-all duration-300 hover:border-slate-300 hover:shadow-md sm:p-4"
                          >
                            <span className="block truncate text-xs font-medium text-slate-500 sm:text-sm">
                              {columna.label}
                            </span>
                            <div className="mt-1 text-xl font-bold text-slate-800 sm:text-2xl">
                              {formatNumber(
                                obtenerTotalColumna(bloque, columna.key)
                              )}
                            </div>
                          </div>
                        ))}

                        <div className="min-w-0 rounded-lg border border-slate-300 bg-slate-600 p-3 text-white transition-all duration-300 hover:bg-slate-700 hover:shadow-md xs:col-span-2 sm:col-span-1 sm:p-4">
                          <span className="block truncate text-xs font-medium text-slate-100 sm:text-sm">
                            Total General
                          </span>
                          <div className="mt-1 text-xl font-bold sm:text-2xl">
                            {formatNumber(obtenerTotalGeneralBloque(bloque))}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          expandidos[bloque.hora]
                            ? "max-h-[2400px] opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <TablaWipOperacionResumen
                          bloque={bloque}
                          columnasPrincipales={columnasPrincipales}
                          formatNumber={formatNumber}
                          getFechaCorta={getFechaCorta}
                          obtenerTotalDetalle={obtenerTotalDetalle}
                          obtenerTotalFila={obtenerTotalFila}
                          obtenerTotalColumna={obtenerTotalColumna}
                          obtenerTotalColumnaRegistro={
                            obtenerTotalColumnaRegistro
                          }
                          obtenerTotalDetalleColumna={
                            obtenerTotalDetalleColumna
                          }
                          obtenerTotalGeneralBloque={
                            obtenerTotalGeneralBloque
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReporteWipOperacionResumen;
