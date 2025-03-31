import React from 'react';
const ModalSemanas = ({ isOpen, onClose, semanasData }) => {
  if (!isOpen) return null;
  // Función para formatear una fecha (en formato dd/mm/yyyy) a un formato extendido en español
  const formatDateFull = (dateString) => {
    // Se espera que dateString venga con el formato "dd/mm/yyyy"
    const [day, month, year] = dateString.split('/');
    // Se crea un objeto Date usando el formato "yyyy-mm-dd"
    const date = new Date(`${year}-${month}-${day}`);
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Fondo semitransparente que cierra el modal al hacer click */}
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      {/* Contenido del modal */}
      <div className="bg-white p-8 rounded-lg shadow-xl relative z-10 max-w-6xl w-full">
        <h2 className="text-2xl font-bold mb-6 text-center uppercase text-gray-500">Semanas y Rangos de Fechas</h2>
        {/* Lista en dos columnas */}
        <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {semanasData.map((semana, index) => {
            // Se asume que 'semana.rango' tiene el formato "dd/mm/yyyy - dd/mm/yyyy"
            const [start, end] = semana.rango.split(' - ');
            return (
              <div key={index} className="border p-4 rounded shadow-sm">
                <p className="font-medium text-lg mb-1 text-cyan-600">Semana {semana.semana}</p>
                <p className="text-sm text-gray-600">
                  {formatDateFull(start)} <br /> – <br /> {formatDateFull(end)}
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
export default ModalSemanas;