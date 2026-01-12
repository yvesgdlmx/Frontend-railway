import React, { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

const CardResumenResultado = ({ datos }) => {
  const [expandedCards, setExpandedCards] = useState({})

  const esHoy = (fecha) => {
    const hoy = new Date();
    const fechaRegistro = new Date(fecha + 'T00:00:00');
    return fechaRegistro.toDateString() === hoy.toDateString();
  }

  const formatNumber = (num, fecha) => {
    if (num === null || num === undefined) {
      return esHoy(fecha) ? 'ESPERANDO...' : '0';
    }
    if (num === 0) return '0.00';
    return num.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatInteger = (num, fecha) => {
    if (num === null || num === undefined) {
      return esHoy(fecha) ? 'ESPERANDO...' : '0';
    }
    return Math.round(num).toLocaleString('es-MX')
  }

  const formatCurrency = (num, fecha) => {
    if (num === null || num === undefined) {
      return esHoy(fecha) ? 'ESPERANDO...' : '0';
    }
    return `$${num.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-MX', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  const getColorClass = (num) => {
    if (num === null || num === undefined || num === 0) return 'text-gray-600 bg-gray-100'
    return num > 0 
      ? 'text-green-600 bg-green-100' 
      : 'text-red-600 bg-red-100'
  }

  const getIndicadorColorClass = (num) => {
    if (num === null || num === undefined || num === 0) return 'text-red-600 bg-red-100'
    if (num > 4.0) return 'text-green-600 bg-green-100'
    return 'text-red-600 bg-red-100'
  }

  const toggleExpand = (index) => {
    setExpandedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const datosOrdenados = [...datos].sort((a, b) =>
    new Date(b.diario) -  new Date(a.diario)
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {datosOrdenados.map((fila, index) => (
        <div 
          key={index} 
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
              <div className='flex justify-between items-center'>
                <h3 className="text-md font-semibold">Semana: {fila.semana}</h3>
                <p className="text-md text-blue-100 mt-1">{formatDate(fila.diario)}</p>
              </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Semi-finished */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Semi-finished (SF)</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Meta</p>
                  <p className="text-lg font-semibold text-gray-700">{formatInteger(fila.metaSF, fila.diario)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Real</p>
                  <p className="text-lg font-semibold text-gray-700">{formatInteger(fila.realSF, fila.diario)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Diferencia</p>
                  <p className={`text-lg font-bold rounded-lg py-1 ${getColorClass(fila.diferenciaSF)}`}>
                    {formatInteger(fila.diferenciaSF, fila.diario)}
                  </p>
                </div>
              </div>
            </div>

            {/* Finished (F) */}
            <div className="border-t pt-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Finished (F)</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Meta</p>
                  <p className="text-lg font-semibold text-gray-700">{formatInteger(fila.metaF, fila.diario)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Real</p>
                  <p className="text-lg font-semibold text-gray-700">{formatInteger(fila.realF, fila.diario)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Diferencia</p>
                  <p className={`text-lg font-bold rounded-lg py-1 ${getColorClass(fila.diferenciaF)}`}>
                    {formatInteger(fila.diferenciaF, fila.diario)}
                  </p>
                </div>
              </div>
            </div>

            {/* Finished (F) */}
            <div className="border-t pt-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">(Finished (F) + Semi-finished (SF))</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Proyectado</p>
                  <p className="text-lg font-semibold text-gray-700">{formatInteger(fila.proyectadoSuma, fila.diario)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Real</p>
                  <p className="text-lg font-semibold text-gray-700">{formatInteger(fila.realSuma, fila.diario)}</p>
                </div>
              </div>
            </div>

            {/* Facturación */}
            <div className="border-t pt-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Facturación</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Proyectada</p>
                  <p className="text-sm font-semibold text-gray-700">{formatCurrency(fila.factProyect, fila.diario)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Real</p>
                  <p className="text-sm font-semibold text-gray-700">{formatCurrency(fila.facturacionReal, fila.diario)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Diferencia</p>
                  <p className={`text-sm font-bold rounded-lg py-1 ${getColorClass(fila.diferencia2)}`}>
                    {formatCurrency(fila.diferencia2, fila.diario)}
                  </p>
                </div>
              </div>
            </div>

            {/* Detalles expandibles */}
            {expandedCards[index] && (
              <div className="border-t pt-4 space-y-4 animate-fadeIn">
                {/* Acumulados */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Acumulados</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`p-2 rounded-lg ${getColorClass(fila.acumuladoSF)}`}>
                      <p className="text-xs">Acum. SF Mensual</p>
                      <p className="font-bold">{formatInteger(fila.acumuladoSF, fila.diario)}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${getColorClass(fila.acumuladoF)}`}>
                      <p className="text-xs">Acum. F Mensual</p>
                      <p className="font-bold">{formatInteger(fila.acumuladoF, fila.diario)}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${getColorClass(fila.acumuladoMensual)}`}>
                      <p className="text-xs">Acum. Fact. Mensual</p>
                      <p className="font-bold">{formatCurrency(fila.acumuladoMensual, fila.diario)}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${getColorClass(fila.acumuladoAnual)}`}>
                      <p className="text-xs">Acum. Fact. Anual</p>
                      <p className="font-bold">{formatCurrency(fila.acumuladoAnual, fila.diario)}</p>
                    </div>
                    <div className={`p-2 rounded-lg col-span-2 ${getColorClass(fila.acumuladoQuincenal)}`}>
                      <p className="text-xs">Acum. Fact. Quincenal (Q{fila.quincena})</p>
                      <p className="font-bold">{formatCurrency(fila.acumuladoQuincenal, fila.diario)}</p>
                    </div>
                  </div>
                </div>

                {/* Trabajos por turno */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Trabajos por Turno</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 p-2 rounded-lg text-center">
                      <p className="text-xs text-gray-600">Nocturno</p>
                      <p className="font-bold text-gray-700">{formatInteger(fila.trabajosNocturno, fila.diario)}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg text-center">
                      <p className="text-xs text-gray-600">Matutino</p>
                      <p className="font-bold text-gray-700">{formatInteger(fila.trabajosMat, fila.diario)}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg text-center">
                      <p className="text-xs text-gray-600">Vespertino</p>
                      <p className="font-bold text-gray-700">{formatInteger(fila.trabajosVesp, fila.diario)}</p>
                    </div>
                  </div>
                </div>

                {/* Asistencias */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Asistencias</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 p-2 rounded-lg text-center">
                      <p className="text-xs text-gray-600">Nocturno</p>
                      <p className="font-bold text-gray-700">{formatInteger(fila.asistenciaNocturno, fila.diario)}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg text-center">
                      <p className="text-xs text-gray-600">Matutino</p>
                      <p className="font-bold text-gray-700">{formatInteger(fila.asistenciaMat, fila.diario)}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg text-center">
                      <p className="text-xs text-gray-600">Vespertino</p>
                      <p className="font-bold text-gray-700">{formatInteger(fila.asistenciaVesp, fila.diario)}</p>
                    </div>
                  </div>
                </div>

                {/* OHO (Indicadores) */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Indicadores OHO</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className={`p-2 rounded-lg text-center ${getIndicadorColorClass(fila.indicadorNocturno)}`}>
                      <p className="text-xs">Nocturno</p>
                      <p className="font-bold">{formatNumber(fila.indicadorNocturno, fila.diario)}</p>
                    </div>
                    <div className={`p-2 rounded-lg text-center ${getIndicadorColorClass(fila.indicadorNocturnoMat)}`}>
                      <p className="text-xs">Matutino</p>
                      <p className="font-bold">{formatNumber(fila.indicadorNocturnoMat, fila.diario)}</p>
                    </div>
                    <div className={`p-2 rounded-lg text-center ${getIndicadorColorClass(fila.indicadorVesp)}`}>
                      <p className="text-xs">Vespertino</p>
                      <p className="font-bold">{formatNumber(fila.indicadorVesp, fila.diario)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botón expandir */}
            <button
              onClick={() => toggleExpand(index)}
              className="w-full mt-4 py-2 px-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 
                       text-blue-700 font-semibold rounded-lg transition-all duration-200 
                       flex items-center justify-center gap-2 border border-blue-200"
            >
              {expandedCards[index] ? (
                <>
                  <span>Ver menos</span>
                  <ChevronUpIcon className="h-5 w-5" />
                </>
              ) : (
                <>
                  <span>Ver más detalles</span>
                  <ChevronDownIcon className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CardResumenResultado