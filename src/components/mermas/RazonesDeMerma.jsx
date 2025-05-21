import React, { useEffect, useState } from 'react';
import clienteAxios from '../../../config/clienteAxios';
import Heading from '../others/Heading';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
// Función para obtener la fecha en formato YYYY-MM-DD
const obtenerFechaLocal = (fecha) => {
  const anio = fecha.getFullYear();
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const dia = fecha.getDate().toString().padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};
const RazonesDeMerma = () => {
  const [mermasPorHora, setMermasPorHora] = useState({});
  // Estado para controlar la visualización de detalles de cada razón
  const [expandedItems, setExpandedItems] = useState({});
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const respuesta = await clienteAxios.get('/mermas/razones_de_merma');
        const registros = respuesta.data.registros;
        // Determinar las fechas según la lógica de turno
        const ahora = new Date();
        const horaActual = ahora.getHours();
        let fechaObjetivo, fechaAnterior;
        if (horaActual < 22) {
          fechaObjetivo = obtenerFechaLocal(ahora);
          const ayer = new Date(ahora);
          ayer.setDate(ahora.getDate() - 1);
          fechaAnterior = obtenerFechaLocal(ayer);
        } else {
          // Para horas ≥22:00 asignamos el turno al "día siguiente"
          fechaObjetivo = obtenerFechaLocal(new Date(ahora.getTime() + 24 * 60 * 60 * 1000));
          fechaAnterior = obtenerFechaLocal(ahora);
        }
        // Filtrar registros según el turno:
        // - De fechaAnterior: registros con hora >= "22:00"
        // - De fechaObjetivo: registros con hora < "22:00"
        const registrosTurno = registros.filter(reg => {
          if (reg.fecha === fechaAnterior && reg.hora >= "22:00") return true;
          if (reg.fecha === fechaObjetivo && reg.hora < "22:00") return true;
          return false;
        });
        // Agrupar registros por hora
        const agrupados = registrosTurno.reduce((acc, registro) => {
          const { hora } = registro;
          if (!acc[hora]) {
            acc[hora] = [];
          }
          acc[hora].push(registro);
          return acc;
        }, {});
        setMermasPorHora(agrupados);
        console.log('Mermas agrupadas por hora:', agrupados);
      } catch (error) {
        console.error('Error al obtener las razones de merma:', error);
      }
    };
    obtenerDatos();
  }, []);
  // Convierte la hora a un valor numérico, ajustando horas < 22
  const convertirHora = (horaStr) => {
    const [hora] = horaStr.split(':').map(Number);
    return hora < 22 ? hora + 24 : hora;
  };
  // Ordenar las horas de forma descendente (hora más reciente primero)
  const horas = Object.keys(mermasPorHora).sort((a, b) => convertirHora(b) - convertirHora(a));
  // Función para obtener el rango de hora: "HH:mm - HH:mm"
  const obtenerRangoHora = (horaStr) => {
    const [hora, minutos] = horaStr.split(':').map(Number);
    const nuevaHora = (hora + 1) % 24;
    const horaInicio = hora.toString().padStart(2, '0');
    const minInicio = minutos.toString().padStart(2, '0');
    const horaFin = nuevaHora.toString().padStart(2, '0');
    const minFin = minutos.toString().padStart(2, '0');
    return `${horaInicio}:${minInicio} - ${horaFin}:${minFin}`;
  };
  // Función para alternar la visibilidad de detalles para un item (identificado por hora y razón)
  const toggleDetalle = (key) => {
    setExpandedItems(prevState => ({
      ...prevState,
      [key]: !prevState[key]
    }));
  };
  return (
    <div className="mx-auto py-4">
      <Heading title={'Razones mermas acumuladas'} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {horas.map((hora) => {
          // Agrupar dentro de cada hora por la razón de merma
          const agrupadosPorRazon = mermasPorHora[hora].reduce((acc, registro) => {
            const { razon } = registro;
            if (!acc[razon]) {
              acc[razon] = [];
            }
            acc[razon].push(registro);
            return acc;
          }, {});
          // Suma total de la hora
          const sumaTotalHora = mermasPorHora[hora].reduce(
            (acumulador, merma) => acumulador + Number(merma.total),
            0
          );
          return (
            // Contenedor por hora
            <div key={hora} className="bg-white shadow-md rounded-md flex flex-col">
              <div className="bg-blue-500 text-white py-2 text-center text-lg font-semibold">
                {obtenerRangoHora(hora)}
              </div>
              <div className="p-2">
                {Object.keys(agrupadosPorRazon).map((razon) => {
                  // Generamos una llave única para cada item (hora y razón)
                  const keyItem = `${hora}-${razon}`;
                  // Suma total para la razón en particular
                  const sumaTotalRazon = agrupadosPorRazon[razon].reduce(
                    (acum, reg) => acum + Number(reg.total),
                    0
                  );
                  return (
                    <div key={keyItem} className="mb-4">
                      <div className="flex justify-between items-center bg-gray-100 p-2 rounded text-gray-600">
                        <span className="font-medium text-sm w-40 truncate">{razon}</span>
                        <span className="font-semibold text-sm">{sumaTotalRazon}</span>
                        {/* Botón para mostrar/ocultar detalles */}
                        <button onClick={() => toggleDetalle(keyItem)} className="ml-2 focus:outline-none">
                          {expandedItems[keyItem] ? (
                            <ChevronUpIcon className="w-5 h-5" />
                          ) : (
                            <ChevronDownIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {/* Sección de detalles que se muestra al hacer click */}
                      {expandedItems[keyItem] && (
                        <div className="p-4 w-full bg-white border border-gray-200 rounded shadow-lg mt-2 max-h-64 overflow-y-auto">
                          <h4 className="text-md text-center font-semibold mb-2 text-cyan-600">Detalles</h4>
                          {/* Encabezado de la "tabla" */}
                          <div className="grid grid-cols-4 gap-12 border-b border-gray-300 pb-2 px-2">
                            <div className="text-xs font-bold text-gray-700 whitespace-nowrap">Traynumber</div>
                            <div className="text-xs font-bold text-gray-700 whitespace-nowrap">Department</div>
                            <div className="text-xs font-bold text-gray-700 whitespace-nowrap">Position</div>
                            <div className="text-xs font-bold text-gray-700 whitespace-nowrap">Part</div>
                          </div>
                          {/* Filas de contenido con fondo alterno y sin borde en la última fila */}
                          {agrupadosPorRazon[razon].map((detalle, i) => {
                            const isLast = i === agrupadosPorRazon[razon].length - 1;
                            const bgColor = i % 2 === 0 ? "bg-blue-50" : "";
                            return (
                              <div
                                key={`detalle-${i}`}
                                className={`${bgColor} ${!isLast ? "border-b border-gray-300" : ""}`}
                              >
                                <div className="grid grid-cols-4 gap-12 py-2 px-2">
                                  <div className="text-xs text-gray-600 whitespace-nowrap">{detalle.traynumber}</div>
                                  <div className="text-xs text-gray-600 whitespace-nowrap">{detalle.department}</div>
                                  <div className="text-xs text-gray-600 whitespace-nowrap">{detalle.position}</div>
                                  <div className="text-xs text-gray-600 whitespace-nowrap uppercase">{detalle.part}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="bg-blue-100 text-gray-500 text-center py-4 px-2 mt-auto m-2 rounded font-semibold">
                Total: {sumaTotalHora}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default RazonesDeMerma;