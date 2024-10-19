import React from 'react';

const InformacionTurnos = ({ nombreEstacion, turnos }) => {
  return (
    <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-md">
      <h3 className="font-semibold text-lg mb-2">Turnos - {nombreEstacion}</h3>
      <div className="flex flex-col sm:flex-row justify-between">
        <p>Matutino: <span className="font-bold text-blue-700">{turnos.matutino}</span></p>
        <p>Vespertino: <span className="font-bold text-blue-700">{turnos.vespertino}</span></p>
        <p>Nocturno: <span className="font-bold text-blue-700">{turnos.nocturno}</span></p>
      </div>
    </div>
  );
};

export default InformacionTurnos;