import React, { useState, useEffect } from 'react';
import { XMarkIcon, ChartBarIcon, CalendarDaysIcon, CheckCircleIcon, FunnelIcon } from '@heroicons/react/24/outline';
import useResumenResultados from '../../../hooks/reportes/useResumenResultados';

const ModalMetasResultados = ({ isOpen, onClose }) => {
  const { todosLosDatos, actualizarMetasDiarias } = useResumenResultados();
  const [mesSeleccionado, setMesSeleccionado] = useState('');
  const [metasPorDia, setMetasPorDia] = useState({});
  const [guardando, setGuardando] = useState(false);

  // Resetear al abrir - SOLO el mes, NO las metas
  useEffect(() => {
    if (isOpen) {
      const fechaActual = new Date();
      const mesActual = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}`;
      setMesSeleccionado(mesActual);
      // ❌ NO RESETEAR metasPorDia aquí
    }
  }, [isOpen]);

  // Cuando cambia el mes O todosLosDatos, cargar las metas actuales
  useEffect(() => {
    if (mesSeleccionado && todosLosDatos.length > 0) {
      const diasDelMes = todosLosDatos.filter(item => {
        const fechaObj = new Date(item.diario + 'T00:00:00');
        const mesFecha = `${fechaObj.getFullYear()}-${String(fechaObj.getMonth() + 1).padStart(2, '0')}`;
        return mesFecha === mesSeleccionado;
      }).sort((a, b) => new Date(a.diario) - new Date(b.diario));
      
      const metasIniciales = {};
      diasDelMes.forEach(dia => {
        metasIniciales[dia.id] = {
          diario: dia.diario,
          meta_sf: dia.metaSF || 0,
          meta_f: dia.metaF || 0,
          fact_proyect: dia.factProyect || 0,
        };
      });
      
      console.log('🔄 Cargando metas desde todosLosDatos:', metasIniciales);
      setMetasPorDia(metasIniciales);
    }
  }, [mesSeleccionado, todosLosDatos]); // ✅ Agregar todosLosDatos como dependencia

  // Obtener fechas únicas
  const todasLasFechas = [...new Set(todosLosDatos.map(item => item.diario))].sort();
  
  // Obtener meses únicos disponibles
  const mesesDisponibles = [...new Set(todasLasFechas.map(fecha => {
    const fechaObj = new Date(fecha + 'T00:00:00');
    return `${fechaObj.getFullYear()}-${String(fechaObj.getMonth() + 1).padStart(2, '0')}`;
  }))].sort().reverse();

  // Obtener días del mes seleccionado
  const obtenerDiasDelMes = () => {
    if (!mesSeleccionado) return [];
    
    return todosLosDatos.filter(item => {
      const fechaObj = new Date(item.diario + 'T00:00:00');
      const mesFecha = `${fechaObj.getFullYear()}-${String(fechaObj.getMonth() + 1).padStart(2, '0')}`;
      return mesFecha === mesSeleccionado;
    }).sort((a, b) => new Date(a.diario) - new Date(b.diario));
  };

  const diasDelMes = obtenerDiasDelMes();

  // Manejar cambio de meta
  const handleMetaChange = (registroId, campo, valor) => {
    setMetasPorDia(prev => ({
      ...prev,
      [registroId]: {
        ...prev[registroId],
        [campo]: parseFloat(valor) || 0
      }
    }));
  };

  // Guardar todas las metas del mes
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (Object.keys(metasPorDia).length === 0) {
      return;
    }

    setGuardando(true);

    const payload = Object.entries(metasPorDia).map(([id, metas]) => ({
      id: parseInt(id),
      diario: metas.diario,
      meta_sf: metas.meta_sf,
      meta_f: metas.meta_f,
      fact_proyect: metas.fact_proyect
    }));

    console.log('📤 Payload enviado al backend:', payload);

    const exito = await actualizarMetasDiarias(payload);
    
    setGuardando(false);
    
    if (exito) {
      onClose();
    }
  };

  // Función para verificar si un día tiene metas completas
  const tieneMetasCompletas = (registro) => {
    return registro.metaSF > 0 && registro.metaF > 0 && registro.factProyect > 0;
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Configurar Metas por Mes</h2>
              <p className="text-blue-100 text-sm mt-1">Selecciona un mes y asigna las metas diarias</p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Selector de Mes */}
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

          {/* Tabla de Metas por Día */}
          {mesSeleccionado && diasDelMes.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                      <th className="py-3 px-4 text-left font-semibold text-sm w-8">✓</th>
                      <th className="py-3 px-4 text-left font-semibold text-sm">Fecha</th>
                      <th className="py-3 px-4 text-center font-semibold text-sm">Meta SF</th>
                      <th className="py-3 px-4 text-center font-semibold text-sm">Meta F</th>
                      <th className="py-3 px-4 text-center font-semibold text-sm">Proyectado Suma</th>
                      <th className="py-3 px-4 text-center font-semibold text-sm">Meta Facturación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diasDelMes.map((dia, index) => {
                      const metaActual = metasPorDia[dia.id] || {
                        meta_sf: 0,
                        meta_f: 0,
                        fact_proyect: 0
                      };
                      
                      const proyectadoSuma = metaActual.meta_sf + metaActual.meta_f;
                      const esCompleto = tieneMetasCompletas(dia);

                      return (
                        <tr 
                          key={dia.id}
                          className={`border-t hover:bg-blue-50 transition-colors ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <td className="py-3 px-4 text-center">
                            {esCompleto ? (
                              <span className="text-lg" title="Metas completas">✅</span>
                            ) : (
                              <span className="text-lg" title="Sin metas">🔴</span>
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
                              value={metaActual.meta_sf}
                              onChange={(e) => handleMetaChange(dia.id, 'meta_sf', e.target.value)}
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
                              value={metaActual.meta_f}
                              onChange={(e) => handleMetaChange(dia.id, 'meta_f', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                       text-center focus:ring-2 focus:ring-blue-500 
                                       focus:border-blue-500 font-semibold text-gray-700
                                       hover:border-blue-400 transition-colors"
                              placeholder="0"
                            />
                          </td>

                          <td className="py-3 px-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg py-2 px-3 text-center">
                              <span className="font-bold text-blue-700">
                                {proyectadoSuma.toLocaleString('es-MX')}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-gray-600 font-bold text-sm">
                                $
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={metaActual.fact_proyect}
                                onChange={(e) => handleMetaChange(dia.id, 'fact_proyect', e.target.value)}
                                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg 
                                         text-center focus:ring-2 focus:ring-blue-500 
                                         focus:border-blue-500 font-semibold text-gray-700
                                         hover:border-blue-400 transition-colors"
                                placeholder="0.00"
                              />
                            </div>
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
                  <span className="text-gray-600">Metas completas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🔴</span>
                  <span className="text-gray-600">Sin metas o incompletas</span>
                </div>
              </div>
            </div>
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
          
          <div className="flex gap-3">
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
                  Guardar Metas del Mes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalMetasResultados;