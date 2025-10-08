import React from "react";
import { formatNumber } from "../../../helpers/formatNumber";

function CardFlujoWipMobile({ fecha, dia }) {
  const totalRecibidos =
    (dia.recibidos?.total_hoya || 0) +
    (dia.recibidos?.total_ink || 0) +
    (dia.recibidos?.total_nvi || 0);
  const totalCancelados =
    (dia.cancelados?.total_hoya || 0) +
    (dia.cancelados?.total_ink || 0) +
    (dia.cancelados?.total_nvi || 0);
  const totalEnviados =
    (dia.enviados?.total_hoya || 0) +
    (dia.enviados?.total_ink || 0) +
    (dia.enviados?.total_nvi || 0);

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-md">
      <div className="bg-blue-500 text-white p-4">
        <div className="font-semibold text-lg">{fecha}</div>
      </div>
      <div className="p-4 grid grid-cols-2 gap-4">
        {/* Hoya */}
        <div className="border-b border-gray-200 pb-2 flex justify-between">
          <span className="text-gray-600">Hoya Recibidos:</span>
          <span className="font-bold text-gray-500">{dia.recibidos ? formatNumber(dia.recibidos.total_hoya) : '-'}</span>
        </div>
        <div className="border-b border-gray-200 pb-2 flex justify-between">
          <span className="text-gray-600">Hoya Cancelados:</span>
          <span className="font-bold text-gray-500">{dia.cancelados ? formatNumber(dia.cancelados.total_hoya) : '-'}</span>
        </div>
        <div className="border-b border-gray-200 pb-2 flex justify-between">
          <span className="text-gray-600">Hoya Enviados:</span>
          <span className="font-bold text-gray-500">{dia.enviados ? formatNumber(dia.enviados.total_hoya) : '-'}</span>
        </div>
        {/* Ink */}
        <div className="border-b border-gray-200 pb-2 flex justify-between">
          <span className="text-gray-600">Ink Recibidos:</span>
          <span className="font-bold text-gray-500">{dia.recibidos ? formatNumber(dia.recibidos.total_ink) : '-'}</span>
        </div>
        <div className="border-b border-gray-200 pb-2 flex justify-between">
          <span className="text-gray-600">Ink Cancelados:</span>
          <span className="font-bold text-gray-500">{dia.cancelados ? formatNumber(dia.cancelados.total_ink) : '-'}</span>
        </div>
        <div className="border-b border-gray-200 pb-2 flex justify-between">
          <span className="text-gray-600">Ink Enviados:</span>
          <span className="font-bold text-gray-500">{dia.enviados ? formatNumber(dia.enviados.total_ink) : '-'}</span>
        </div>
        {/* NVI */}
        <div className="border-b border-gray-200 pb-2 flex justify-between">
          <span className="text-gray-600">NVI Recibidos:</span>
          <span className="font-bold text-gray-500">{dia.recibidos ? formatNumber(dia.recibidos.total_nvi) : '-'}</span>
        </div>
        <div className="border-b border-gray-200 pb-2 flex justify-between">
          <span className="text-gray-600">NVI Cancelados:</span>
          <span className="font-bold text-gray-500">{dia.cancelados ? formatNumber(dia.cancelados.total_nvi) : '-'}</span>
        </div>
        <div className="border-b border-gray-200 pb-2 flex justify-between">
          <span className="text-gray-600">NVI Enviados:</span>
          <span className="font-bold text-gray-500">{dia.enviados ? formatNumber(dia.enviados.total_nvi) : '-'}</span>
        </div>
        {/* Totales por fila */}
        <div className="border-b border-gray-200 pb-2 flex justify-between col-span-2">
          <span className="text-green-700 font-semibold">Total Recibidos:</span>
          <span className="font-bold text-green-700">{formatNumber(totalRecibidos)}</span>
        </div>
        <div className="border-b border-gray-200 pb-2 flex justify-between col-span-2">
          <span className="text-green-700 font-semibold">Total Cancelados:</span>
          <span className="font-bold text-green-700">{formatNumber(totalCancelados)}</span>
        </div>
        <div className="pb-2 flex justify-between col-span-2">
          <span className="text-green-700 font-semibold">Total Enviados:</span>
          <span className="font-bold text-green-700">{formatNumber(totalEnviados)}</span>
        </div>
      </div>
    </div>
  );
}

export default CardFlujoWipMobile;