import React, { useEffect, useState } from 'react';
import clienteAxios from '../../../config/clienteAxios';
import Heading from '../others/Heading';
// Función de utilidad para obtener una fecha en formato YYYY-MM-DD
const obtenerFechaLocal = (fecha) => {
  const anio = fecha.getFullYear();
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const dia = fecha.getDate().toString().padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};
const RazonesDeMerma = () => {
  const [mermasPorHora, setMermasPorHora] = useState({});
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const respuesta = await clienteAxios.get('/mermas/razones_de_merma');
        const registros = respuesta.data.registros;
        // Obtener la hora actual y definir fechas según la lógica de turno:
        // • Si la hora actual es menor a las 22:00:
        //    - fechaObjetivo es la fecha actual.
        //    - fechaAnterior es la fecha de ayer.
        // • Si la hora actual es ≥22:00:
        //    - fechaObjetivo es la fecha de mañana.
        //    - fechaAnterior es la fecha actual.
        const ahora = new Date();
        const horaActual = ahora.getHours();
        let fechaObjetivo, fechaAnterior;
        if (horaActual < 22) {
          fechaObjetivo = obtenerFechaLocal(ahora);
          const ayer = new Date(ahora);
          ayer.setDate(ahora.getDate() - 1);
          fechaAnterior = obtenerFechaLocal(ayer);
        } else {
          // Para horas ≥22:00, el turno se asigna al "día siguiente"
          fechaObjetivo = obtenerFechaLocal(new Date(ahora.getTime() + 24 * 60 * 60 * 1000));
          fechaAnterior = obtenerFechaLocal(ahora);
        }
        // Filtrar registros según el turno:
        // • De la fechaAnterior: solo registros con hora >= "22:00" (se asume formato "HH:mm" o "HH:mm:ss")
        // • De la fechaObjetivo: solo registros con hora < "22:00"
        const registrosTurno = registros.filter(reg => {
          if (reg.fecha === fechaAnterior && reg.hora >= "22:00") return true;
          if (reg.fecha === fechaObjetivo && reg.hora < "22:00") return true;
          return false;
        });
        // Agrupar los registros filtrados por hora (la propiedad "hora")
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
  // Función para convertir la hora a un valor numérico considerando que las horas previas a las 22 se ajustan (se les suma 24)
  const convertirHora = (horaStr) => {
    const [hora] = horaStr.split(':').map(Number);
    return hora < 22 ? hora + 24 : hora;
  };
  // Ordenar las horas de forma descendente (para que la hora más reciente esté primero)
  const horas = Object.keys(mermasPorHora).sort((a, b) => {
    return convertirHora(b) - convertirHora(a);
  });
  // Función para obtener el rango de hora: "HH:mm - HH:mm", sumándole una hora al inicio
  const obtenerRangoHora = (horaStr) => {
    const [hora, minutos] = horaStr.split(':').map(Number);
    const nuevaHora = (hora + 1) % 24;
    const horaInicio = hora.toString().padStart(2, '0');
    const minInicio = minutos.toString().padStart(2, '0');
    const horaFin = nuevaHora.toString().padStart(2, '0');
    const minFin = minutos.toString().padStart(2, '0');
    return `${horaInicio}:${minInicio} - ${horaFin}:${minFin}`;
  };
  return (
    <div className="mx-auto py-4">
      <Heading title={'Razones mermas acumuladas'} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {horas.map((hora) => {
          const sumaTotal = mermasPorHora[hora].reduce(
            (acumulador, merma) => acumulador + Number(merma.total),
            0
          );
          return (
            <div
              key={hora}
              className="bg-white shadow-md rounded-md overflow-hidden flex flex-col"
            >
              <div className="bg-blue-500 text-white py-2 text-center text-lg font-semibold">
                {obtenerRangoHora(hora)}
              </div>
              <div className="flex flex-wrap text-sm text-gray-600 p-2">
                {mermasPorHora[hora].map((merma) => (
                  <div key={merma.id} className="w-1/2 p-2">
                    <div className="flex justify-between bg-gray-100 p-2 rounded">
                      <span>{merma.razon}</span>
                      <span>{merma.total}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-blue-100 text-gray-500 text-center py-4 px-2 mt-auto m-2 rounded font-semibold">
                Total: {sumaTotal}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default RazonesDeMerma;