import React, { useEffect, useState } from 'react';
import clienteAxios from '../../../config/clienteAxios';
import Heading from '../others/Heading';
const RazonesDeMerma = () => {
  const [mermasPorHora, setMermasPorHora] = useState({});
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const respuesta = await clienteAxios.get('/mermas/razones_de_merma');
        const registros = respuesta.data.registros;
        // Agrupar los registros por hora
        const agrupados = registros.reduce((acc, registro) => {
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
  // Función para convertir la hora en un valor numérico que respete tu jornada laboral:
  // Si la hora es menor a 22, se le suma 24 para que se ordenen después de las horas >= 22.
  const convertirHora = (horaStr) => {
    const [hora] = horaStr.split(':').map(Number);
    return hora < 22 ? hora + 24 : hora;
  };
  // Ordenar las horas de forma descendente para tener la hora más reciente arriba.
  const horas = Object.keys(mermasPorHora).sort((a, b) => {
    return convertirHora(b) - convertirHora(a);
  });
  // Función para obtener el rango de hora: "HH:mm - HH:mm", sumando una hora.
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
      <Heading title={'Razones de merma'} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {horas.map((hora) => {
          const sumaTotal = mermasPorHora[hora].reduce(
            (acumulador, merma) => acumulador + merma.total,
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
              {/* Contenedor para ubicar los items en dos columnas */}
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
              {/* Div para mostrar la suma total, ubicado al final del card */}
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