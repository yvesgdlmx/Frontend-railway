import React, { useState, useEffect } from 'react';
import { XMarkIcon, UserGroupIcon, CalendarDaysIcon, CheckCircleIcon, FunnelIcon } from '@heroicons/react/24/outline';
import useResumenResultados from '../../../hooks/reportes/useResumenResultados';

const ModalAsistencias = ({ isOpen, onClose }) => {
  const { datos, actualizarAsistencias } = useResumenResultados();
  const [mesSeleccionado, setMesSeleccionado] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [registroActual, setRegistroActual] = useState(null);
  const [asistencias, setAsistencias] = useState({
    asistencia_nocturno: 0,
    asistencia_mat: 0,
    asistencia_vesp: 0,
  });
  const [guardando, setGuardando] = useState(false);

  // Cuando cambia la fecha seleccionada
  useEffect(() => {
    if (fechaSeleccionada && datos.length > 0) {
      const registro = datos.find(item => item.diario === fechaSeleccionada);
      if (registro) {
        setRegistroActual(registro);
        setAsistencias({
          asistencia_nocturno: registro.asistenciaNocturno || 0,
          asistencia_mat: registro.asistenciaMat || 0,
          asistencia_vesp: registro.asistenciaVesp || 0,
        });
      }
    }
  }, [fechaSeleccionada, datos]);

  // Resetear al abrir
  useEffect(() => {
    if (isOpen) {
      const fechaActual = new Date();
      const mesActual = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}`;
      setMesSeleccionado(mesActual);
      setFechaSeleccionada('');
      setRegistroActual(null);
      setAsistencias({
        asistencia_nocturno: 0,
        asistencia_mat: 0,
        asistencia_vesp: 0,
      });
    }
  }, [isOpen]);

  // Resetear fecha al cambiar mes
  useEffect(() => {
    setFechaSeleccionada('');
    setRegistroActual(null);
  }, [mesSeleccionado]);

  const handleChange = (campo, valor) => {
    setAsistencias(prev => ({
      ...prev,
      [campo]: parseInt(valor) || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!registroActual) {
      return;
    }

    setGuardando(true);

    const payload = [{
      id: registroActual.id,
      diario: registroActual.diario,
      ...asistencias
    }];

    const exito = await actualizarAsistencias(payload);
    
    setGuardando(false);
    if (exito) {
      setFechaSeleccionada('');
      setRegistroActual(null);
      setAsistencias({
        asistencia_nocturno: 0,
        asistencia_mat: 0,
        asistencia_vesp: 0,
      });
    }
  };

  if (!isOpen) return null;

  // Obtener fechas únicas
  const todasLasFechas = [...new Set(datos.map(item => item.diario))].sort();
  
  // Obtener meses únicos disponibles
  const mesesDisponibles = [...new Set(todasLasFechas.map(fecha => {
    const fechaObj = new Date(fecha + 'T00:00:00');
    return `${fechaObj.getFullYear()}-${String(fechaObj.getMonth() + 1).padStart(2, '0')}`;
  }))].sort().reverse();

  // Filtrar fechas por mes seleccionado
  const fechasDelMes = mesSeleccionado 
    ? todasLasFechas.filter(fecha => {
        const fechaObj = new Date(fecha + 'T00:00:00');
        const mesFecha = `${fechaObj.getFullYear()}-${String(fechaObj.getMonth() + 1).padStart(2, '0')}`;
        return mesFecha === mesSeleccionado;
      })
    : todasLasFechas;
  
  // Función para verificar si una fecha tiene asistencias completas
  const tieneAsistenciasCompletas = (fecha) => {
    const registro = datos.find(item => item.diario === fecha);
    if (!registro) return false;
    
    return (registro.asistenciaNocturno > 0 || registro.trabajosNocturno === 0) &&
           (registro.asistenciaMat > 0 || registro.trabajosMat === 0) &&
           (registro.asistenciaVesp > 0 || registro.trabajosVesp === 0);
  };

  // Función para formatear el nombre del mes
  const formatearMes = (mesString) => {
    const [year, month] = mesString.split('-');
    const fecha = new Date(year, month - 1);
    return fecha.toLocaleDateString('es-MX', { year: 'numeric', month: 'long' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Asignar Asistencias</h2>
              <p className="text-blue-100 text-sm mt-1">Selecciona un mes y fecha para asignar asistencias</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Selector de Mes */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FunnelIcon className="h-5 w-5 text-indigo-600" />
              Filtrar por Mes
            </label>
            <select
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(e.target.value)}
              className="w-full px-4 py-3 border border-indigo-300 rounded-lg focus:ring-2 
                       focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 font-medium
                       bg-white"
            >
              <option value="">-- Todos los meses --</option>
              {mesesDisponibles.map(mes => (
                <option key={mes} value={mes}>
                  {formatearMes(mes)}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Fecha con Indicadores */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
              Seleccionar Fecha
            </label>
            <select
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 
                       focus:ring-blue-500 focus:border-blue-500 text-gray-700 font-medium
                       bg-white"
              disabled={!mesSeleccionado}
            >
              <option value="">
                {mesSeleccionado 
                  ? '-- Seleccione una fecha --' 
                  : '-- Primero seleccione un mes --'}
              </option>
              {fechasDelMes.map(fecha => {
                const fechaObj = new Date(fecha + 'T00:00:00');
                
                let emoji = '⚪';
                let estado = 'Sin registro';
                
                if (tieneAsistenciasCompletas(fecha)) {
                  emoji = '✅';
                  estado = 'Completo';
                } else {
                  emoji = '🔴';
                  estado = 'Pendiente';
                }
                
                return (
                  <option key={fecha} value={fecha}>
                    {emoji} {fechaObj.toLocaleDateString('es-MX', { 
                      weekday: 'long',
                      day: 'numeric'
                    })} - {estado}
                  </option>
                );
              })}
            </select>
            
            {/* Leyenda */}
            <div className="mt-3 flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">✅</span>
                <span className="text-gray-600">Asistencias completas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🔴</span>
                <span className="text-gray-600">Sin asistencias</span>
              </div>
            </div>
          </div>

          {/* Formulario de Asistencias */}
          {registroActual && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Turno Nocturno */}
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                  <label className="block text-sm font-semibold text-blue-900 mb-2">
                    🌙 Turno Nocturno
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={asistencias.asistencia_nocturno}
                    onChange={(e) => handleChange('asistencia_nocturno', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-center
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                             text-lg font-bold text-blue-900"
                    placeholder="0"
                  />
                  {registroActual.trabajosNocturno > 0 && asistencias.asistencia_nocturno > 0 && (
                    <div className="mt-2 text-xs text-blue-700 text-center">
                      Indicador: <strong>{(registroActual.trabajosNocturno / asistencias.asistencia_nocturno).toFixed(2)}</strong>
                    </div>
                  )}
                </div>

                {/* Turno Matutino */}
                <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
                  <label className="block text-sm font-semibold text-yellow-900 mb-2">
                    ☀️ Turno Matutino
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={asistencias.asistencia_mat}
                    onChange={(e) => handleChange('asistencia_mat', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-yellow-300 rounded-lg text-center
                             focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 
                             text-lg font-bold text-yellow-900"
                    placeholder="0"
                  />
                  {registroActual.trabajosMat > 0 && asistencias.asistencia_mat > 0 && (
                    <div className="mt-2 text-xs text-yellow-700 text-center">
                      Indicador: <strong>{(registroActual.trabajosMat / asistencias.asistencia_mat).toFixed(2)}</strong>
                    </div>
                  )}
                </div>

                {/* Turno Vespertino */}
                <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
                  <label className="block text-sm font-semibold text-orange-900 mb-2">
                    🌆 Turno Vespertino
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={asistencias.asistencia_vesp}
                    onChange={(e) => handleChange('asistencia_vesp', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg text-center
                             focus:ring-2 focus:ring-orange-500 focus:border-orange-500 
                             text-lg font-bold text-orange-900"
                    placeholder="0"
                  />
                  {registroActual.trabajosVesp > 0 && asistencias.asistencia_vesp > 0 && (
                    <div className="mt-2 text-xs text-orange-700 text-center">
                      Indicador: <strong>{(registroActual.trabajosVesp / asistencias.asistencia_vesp).toFixed(2)}</strong>
                    </div>
                  )}
                </div>
              </div>
            </form>
          )}

          {/* Mensaje si no hay fecha seleccionada */}
          {!registroActual && mesSeleccionado && (
            <div className="text-center py-8 text-gray-400">
              <CalendarDaysIcon className="h-16 w-16 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Selecciona una fecha para asignar asistencias</p>
            </div>
          )}

          {/* Mensaje si no hay mes seleccionado */}
          {!mesSeleccionado && (
            <div className="text-center py-8 text-gray-400">
              <FunnelIcon className="h-16 w-16 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Selecciona un mes para comenzar</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg
                     hover:bg-gray-100 font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={guardando || !registroActual}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600
                     hover:from-blue-600 hover:to-blue-700 text-white rounded-lg
                     font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2"
          >
            {guardando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                Guardar Asistencias
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAsistencias;