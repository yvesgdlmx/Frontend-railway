import React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const CardCumplimientoMensual = ({ mes }) => {

  const getPorcentajeColor = (porcentaje) => {
    const num = parseFloat(porcentaje);
    if (num >= 100) return 'bg-green-500';
    if (num >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPorcentajeIcon = (porcentaje) => {
    const num = parseFloat(porcentaje);
    if (num >= 100) {
      return <CheckCircleIcon className="h-6 w-6 text-white" />;
    }
    return <XCircleIcon className="h-6 w-6 text-white" />;
  };

  const porcentajeNum = parseFloat(mes.porcentaje);

  return (
    <div className="bg-white shadow-md rounded-md flex flex-col">
      {/* Header con color según porcentaje */}
      <div className={`${getPorcentajeColor(mes.porcentaje)} text-white py-3 px-4 flex justify-between items-center`}>
        <div className="flex items-center gap-2">
          {getPorcentajeIcon(mes.porcentaje)}
          <span className="text-lg font-semibold">{mes.nombreMes}</span>
        </div>
        <span className="text-2xl font-bold">{mes.porcentaje}%</span>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Resumen rápido */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-blue-50 p-2 rounded text-center border border-blue-200">
            <p className="text-xs text-gray-600">Meta Total</p>
            <p className="text-lg font-semibold text-blue-700">
              {mes.metaTotal.toLocaleString('es-MX')}
            </p>
          </div>
          <div className={`p-2 rounded text-center ${
            mes.realTotal >= mes.metaTotal 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className="text-xs text-gray-600">Real Total</p>
            <p className={`text-lg font-semibold ${
              mes.realTotal >= mes.metaTotal 
                ? 'text-green-700' 
                : 'text-red-700'
            }`}>
              {mes.realTotal.toLocaleString('es-MX')}
            </p>
          </div>
        </div>

        {/* Detalles expandibles */}
        <div className="mt-4 space-y-3">
          {/* SF */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2 border-b pb-1">
              Semi-Finished (SF)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 p-2 rounded border border-blue-200">
                <p className="text-xs text-gray-600">Meta SF</p>
                <p className="text-sm font-bold text-blue-700">
                  {mes.metaSF.toLocaleString('es-MX')}
                </p>
              </div>
              <div className={`p-2 rounded ${
                mes.realSF >= mes.metaSF 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <p className="text-xs text-gray-600">Real SF</p>
                <p className={`text-sm font-bold ${
                  mes.realSF >= mes.metaSF 
                    ? 'text-green-700' 
                    : 'text-red-700'
                }`}>
                  {mes.realSF.toLocaleString('es-MX')}
                </p>
              </div>
            </div>
          </div>

          {/* F */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2 border-b pb-1">
              Finished (F)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 p-2 rounded border border-blue-200">
                <p className="text-xs text-gray-600">Meta F</p>
                <p className="text-sm font-bold text-blue-700">
                  {mes.metaF.toLocaleString('es-MX')}
                </p>
              </div>
              <div className={`p-2 rounded ${
                mes.realF >= mes.metaF 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <p className="text-xs text-gray-600">Real F</p>
                <p className={`text-sm font-bold ${
                  mes.realF >= mes.metaF 
                    ? 'text-green-700' 
                    : 'text-red-700'
                }`}>
                  {mes.realF.toLocaleString('es-MX')}
                </p>
              </div>
            </div>
          </div>

          {/* Diferencia */}
          <div className={`p-2 rounded ${
            mes.diferencia >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <p className="text-xs text-gray-600">Diferencia (Real - Meta)</p>
            <p className={`text-lg font-bold ${
              mes.diferencia >= 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              {mes.diferencia >= 0 ? '+' : ''}{mes.diferencia.toLocaleString('es-MX')}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-blue-100 text-gray-600 text-center py-3 px-2 mt-auto mx-2 mb-2 rounded text-xs font-semibold">
        Basado en {mes.registros} {mes.registros === 1 ? 'registro' : 'registros'}
      </div>
    </div>
  );
};

export default CardCumplimientoMensual;