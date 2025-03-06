import React from 'react';
import { FaTimesCircle } from 'react-icons/fa';
import { formatNumber } from '../../../helpers/formatNumber';

const CardWipDiario = ({ razones, cliente }) => {
  const totalCancelaciones = Object.values(razones).reduce((acc, count) => acc + count, 0);
  if (totalCancelaciones === 0) return null;
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mt-4 mx-2">
      <h3 className="text-sm font-medium text-center text-gray-500 mb-2">
        {cliente.toUpperCase()}
      </h3>
      <h4 className="text-lg font-bold text-center text-gray-800 mb-4 flex items-center justify-center">
        Razones de Cancelación <FaTimesCircle className="text-red-500 ml-2" />
      </h4>
      <ul className="text-sm text-gray-700 space-y-2">
        {Object.entries(razones).map(([issue, count]) => (
          <li key={issue} className="flex justify-between items-center border-b py-2">
            <span>{issue}</span>
            <span className="font-medium text-blue-600">{formatNumber(count)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default CardWipDiario;