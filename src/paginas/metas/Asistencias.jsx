import React, { useState, useEffect } from 'react';
import { UserGroupIcon, CalendarDaysIcon, CheckCircleIcon, FunnelIcon } from '@heroicons/react/24/outline';
import useResumenResultados from '../../../hooks/reportes/useResumenResultados';
import Heading from '../../components/others/Heading';

const Asistencias = () => {
  const { datos, loading, actualizarAsistencias } = useResumenResultados();
  const [mesSeleccionado, setMesSeleccionado] = useState('');
  const [asistenciasPorDia, setAsistenciasPorDia] = useState({});
  const [guardando, setGuardando] = useState(false);

  // Establecer mes actual al cargar
  useEffect(() => {
    if (datos.length > 0) {
      const fechaActual = new Date();
      const mesActual = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}`;
      setMesSeleccionado(mesActual);
    }
  }, [datos]);

  // Cuando cambia el mes, cargar las asistencias actuales
  useEffect(() => {
    if (mesSeleccionado && datos.length > 0) {
      const diasDelMes = datos.filter(item => {
        const fechaObj = new Date(item.diario + 'T00:00:00');
        const mesFecha = `${fechaObj.getFullYear()}-${String(fechaObj.getMonth() + 1).padStart(2, '0')}`;
        return mesFecha === mesSeleccionado;
      }).sort((a, b) => new Date(a.diario) - new Date(b.diario));
      
      const asistenciasIniciales = {};
      diasDelMes.forEach(dia => {
        asistenciasIniciales[dia.id] = {
          diario: dia.diario,
          asistencia_nocturno: dia.asistenciaNocturno || 0,
          asistencia_mat: dia.asistenciaMat || 0,
          asistencia_vesp: dia.asistenciaVesp || 0,
        };
      });
      
      setAsistenciasPorDia(asistenciasIniciales);
    }
  }, [mesSeleccionado, datos]);

  // Obtener fechas únicas
  const todasLasFechas = [...new Set(datos.map(item => item.diario))].sort();
  
  // Obtener meses únicos disponibles
  const mesesDisponibles = [...new Set(todasLasFechas.map(fecha => {
    const fechaObj = new Date(fecha + 'T00:00:00');
    return `${fechaObj.getFullYear()}-${String(fechaObj.getMonth() + 1).padStart(2, '0')}`;
  }))].sort().reverse();

  // Obtener días del mes seleccionado
  const obtenerDiasDelMes = () => {
    if (!mesSeleccionado) return [];
    
    return datos.filter(item => {
      const fechaObj = new Date(item.diario + 'T00:00:00');
      const mesFecha = `${fechaObj.getFullYear()}-${String(fechaObj.getMonth() + 1).padStart(2, '0')}`;
      return mesFecha === mesSeleccionado;
    }).sort((a, b) => new Date(a.diario) - new Date(b.diario));
  };

  const diasDelMes = obtenerDiasDelMes();

  // Manejar cambio de asistencia
  const handleAsistenciaChange = (registroId, campo, valor) => {
    setAsistenciasPorDia(prev => ({
      ...prev,
      [registroId]: {
        ...prev[registroId],
        [campo]: parseInt(valor) || 0
      }
    }));
  };

  // Guardar todas las asistencias del mes
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (Object.keys(asistenciasPorDia).length === 0) {
      return;
    }

    setGuardando(true);

    const payload = Object.entries(asistenciasPorDia).map(([id, asistencias]) => ({
      id: parseInt(id),
      diario: asistencias.diario,
      asistencia_nocturno: asistencias.asistencia_nocturno,
      asistencia_mat: asistencias.asistencia_mat,
      asistencia_vesp: asistencias.asistencia_vesp
    }));

    console.log('📤 Payload enviado al backend:', payload);

    const exito = await actualizarAsistencias(payload);
    
    setGuardando(false);
  };

  // Función para verificar si un día tiene asistencias completas
  const tieneAsistenciasCompletas = (registro) => {
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

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const fechaObj = new Date(fecha + 'T00:00:00');
    return fechaObj.toLocaleDateString('es-MX', { 
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return (
      <div className='p-6'>
        <Heading title={'Registro de Asistencias'} />
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <Heading title={'Registro de Asistencias'} />
      </div>

      {/* Información del módulo */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-5 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <UserGroupIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Registro de Asistencias por Turno</h3>
            <p className="text-sm text-gray-600 mt-1">
              Selecciona un mes y registra las asistencias de cada turno del mes completo
            </p>
          </div>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        
        {/* Selector de Mes */}
        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FunnelIcon className="h-5 w-5 text-indigo-600" />
              Seleccionar Mes
            </label>
            <select
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(e.target.value)}
              className="w-full px-4 py-3 border border-indigo-300 rounded-lg focus:ring-2 
                       focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 font-medium
                       bg-white"
            >
              <option value="">-- Seleccione un mes --</option>
              {mesesDisponibles.map(mes => (
                <option key={mes} value={mes}>
                  {formatearMes(mes)}
                </option>
              ))}
            </select>
          </div>

          {/* Tabla de Asistencias por Día */}
          {mesSeleccionado && diasDelMes.length > 0 ? (
            <>
              {/* Vista de Tabla (Oculta en móvil, visible en tablet y escritorio) */}
              <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <th className="py-3 px-4 text-left font-semibold text-sm w-8">✓</th>
                        <th className="py-3 px-4 text-left font-semibold text-sm">Fecha</th>
                        <th className="py-3 px-4 text-center font-semibold text-sm">Asistencia Nocturno</th>
                        <th className="py-3 px-4 text-center font-semibold text-sm">Asistencia Matutino</th>
                        <th className="py-3 px-4 text-center font-semibold text-sm">Asistencia Vespertino</th>
                      </tr>
                    </thead>
                    <tbody>
                      {diasDelMes.map((dia, index) => {
                        const asistenciasActuales = asistenciasPorDia[dia.id] || {
                          asistencia_nocturno: 0,
                          asistencia_mat: 0,
                          asistencia_vesp: 0,
                        };
                        
                        const esCompleto = tieneAsistenciasCompletas(dia);

                        return (
                          <tr 
                            key={dia.id}
                            className={`border-t hover:bg-blue-50 transition-colors ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                          >
                            <td className="py-3 px-4 text-center">
                              {esCompleto ? (
                                <span className="text-lg" title="Asistencias completas">✅</span>
                              ) : (
                                <span className="text-lg" title="Sin asistencias">🔴</span>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              <div className="font-semibold text-gray-800 text-sm">
                                {dia.diario}
                              </div>
                              <div className="text-xs text-gray-500 capitalize">
                                {formatearFecha(dia.diario)}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <input
                                type="number"
                                min="0"
                                value={asistenciasActuales.asistencia_nocturno}
                                onChange={(e) => handleAsistenciaChange(dia.id, 'asistencia_nocturno', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                         text-center focus:ring-2 focus:ring-blue-500 
                                         focus:border-blue-500 font-semibold text-gray-700
                                         hover:border-blue-400 transition-colors"
                                placeholder="0"
                              />
                            </td>

                            <td className="py-3 px-4">
                              <input
                                type="number"
                                min="0"
                                value={asistenciasActuales.asistencia_mat}
                                onChange={(e) => handleAsistenciaChange(dia.id, 'asistencia_mat', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                         text-center focus:ring-2 focus:ring-blue-500 
                                         focus:border-blue-500 font-semibold text-gray-700
                                         hover:border-blue-400 transition-colors"
                                placeholder="0"
                              />
                            </td>

                            <td className="py-3 px-4">
                              <input
                                type="number"
                                min="0"
                                value={asistenciasActuales.asistencia_vesp}
                                onChange={(e) => handleAsistenciaChange(dia.id, 'asistencia_vesp', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                         text-center focus:ring-2 focus:ring-blue-500 
                                         focus:border-blue-500 font-semibold text-gray-700
                                         hover:border-blue-400 transition-colors"
                                placeholder="0"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">✅</span>
                    <span className="text-gray-600">Asistencias completas</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🔴</span>
                    <span className="text-gray-600">Sin asistencias o incompletas</span>
                  </div>
                </div>
              </div>

              {/* Vista de Cards (Visible en móvil, oculta en tablet y escritorio) */}
              <div className="md:hidden space-y-4">
                {diasDelMes.map((dia, index) => {
                  const asistenciasActuales = asistenciasPorDia[dia.id] || {
                    asistencia_nocturno: 0,
                    asistencia_mat: 0,
                    asistencia_vesp: 0,
                  };
                  
                  const esCompleto = tieneAsistenciasCompletas(dia);

                  return (
                    <div 
                      key={dia.id}
                      className="bg-white border-2 border-gray-200 rounded-xl shadow-md overflow-hidden"
                    >
                      {/* Header de la Card */}
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 flex justify-between items-center">
                        <div>
                          <div className="text-white font-bold text-sm">
                            {dia.diario}
                          </div>
                          <div className="text-blue-100 text-xs capitalize">
                            {formatearFecha(dia.diario)}
                          </div>
                        </div>
                        <div className="text-2xl">
                          {esCompleto ? '✅' : '🔴'}
                        </div>
                      </div>

                      {/* Body de la Card */}
                      <div className="p-4 space-y-4">
                        {/* Nocturno */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                            🌙 Turno Nocturno
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={asistenciasActuales.asistencia_nocturno}
                            onChange={(e) => handleAsistenciaChange(dia.id, 'asistencia_nocturno', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg 
                                     text-center focus:ring-2 focus:ring-blue-500 
                                     focus:border-blue-500 font-bold text-gray-700 text-lg
                                     hover:border-blue-400 transition-colors"
                            placeholder="0"
                          />
                        </div>

                        {/* Matutino */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                            ☀️ Turno Matutino
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={asistenciasActuales.asistencia_mat}
                            onChange={(e) => handleAsistenciaChange(dia.id, 'asistencia_mat', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg 
                                     text-center focus:ring-2 focus:ring-blue-500 
                                     focus:border-blue-500 font-bold text-gray-700 text-lg
                                     hover:border-blue-400 transition-colors"
                            placeholder="0"
                          />
                        </div>

                        {/* Vespertino */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                            🌆 Turno Vespertino
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={asistenciasActuales.asistencia_vesp}
                            onChange={(e) => handleAsistenciaChange(dia.id, 'asistencia_vesp', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg 
                                     text-center focus:ring-2 focus:ring-blue-500 
                                     focus:border-blue-500 font-bold text-gray-700 text-lg
                                     hover:border-blue-400 transition-colors"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {/* Footer de la Card */}
                      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span className="font-medium">Día {index + 1} de {diasDelMes.length}</span>
                          <span className={`px-2 py-1 rounded-full font-semibold ${
                            esCompleto ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {esCompleto ? 'Completo' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Leyenda para móvil */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">✅</span>
                      <span className="text-gray-700 font-medium">Asistencias completas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔴</span>
                      <span className="text-gray-700 font-medium">Sin asistencias o incompletas</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : mesSeleccionado ? (
            <div className="text-center py-12 text-gray-400">
              <CalendarDaysIcon className="h-16 w-16 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No hay registros para este mes</p>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <CalendarDaysIcon className="h-16 w-16 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Selecciona un mes para comenzar</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {mesSeleccionado && diasDelMes.length > 0 && (
              <span>
                <strong>{diasDelMes.length}</strong> días en este mes
              </span>
            )}
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={guardando || !mesSeleccionado || diasDelMes.length === 0}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600
                     hover:from-blue-600 hover:to-blue-700 text-white rounded-lg
                     font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            {guardando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                Guardar Asistencias del Mes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Asistencias;