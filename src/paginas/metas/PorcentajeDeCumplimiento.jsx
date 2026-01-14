import useResumenResultados from '../../../hooks/reportes/useResumenResultados'
import GraficaCumplimientoMensual from '../../components/others/charts/GraficaCumplimientoMensual'
import CardCumplimientoMensual from '../../components/others/cards/CardCumplimientoMensual'
import Heading from '../../components/others/Heading'

const obtenerFechaConNombre = (fecha) => {
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const PorcentajeDeCumplimiento = () => {
  const { porcentajesMensuales, loadingPorcentajes, anioSeleccionado, cambiarAnio } = useResumenResultados()

  const aniosDisponibles = [2024, 2025, 2026, 2027]
  const fechaActualFormateada = obtenerFechaConNombre(new Date());

  if (loadingPorcentajes) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Obtener el mes actual (1-12)
  const mesActual = new Date().getMonth() + 1;
  const anioActual = new Date().getFullYear();

  // Filtrar: mes actual vs otros meses
  // Solo mostrar "Mes Actual" si el año seleccionado es el año actual
  const datosMesActual = anioSeleccionado === anioActual 
    ? porcentajesMensuales.find(mes => mes.mes === mesActual && parseInt(mes.anio) === anioSeleccionado)
    : null;

  const otrosMeses = anioSeleccionado === anioActual
    ? porcentajesMensuales.filter(mes => !(mes.mes === mesActual && parseInt(mes.anio) === anioSeleccionado))
    : porcentajesMensuales; // Si no es el año actual, mostrar todos los meses

  return (
    <>
      <div className="mt-6 md:mt-2">
        <Heading title="Porcentaje de Cumplimiento Mensual" />
      </div>

      {/* Sección para mostrar la fecha actual */}
      <div className="text-center mb-4">
        <p className="text-gray-600 font-medium uppercase">
          FECHA: {fechaActualFormateada}
        </p>
      </div>

      <div className="">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Card informativa - MES ACTUAL */}
          <div className="md:col-span-12 lg:col-span-5">
            <div className="bg-white p-4 rounded shadow-md h-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-center text-gray-500 uppercase">
                  Mes Actual
                </h2>
                
                {/* Selector de año */}
                <select
                  value={anioSeleccionado}
                  onChange={(e) => cambiarAnio(Number(e.target.value))}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           bg-white shadow-sm"
                >
                  {aniosDisponibles.map(anio => (
                    <option key={anio} value={anio}>
                      {anio}
                    </option>
                  ))}
                </select>
              </div>

              {datosMesActual ? (
                <>
                  {/* Nombre del mes actual */}
                  <div className="grid grid-cols-1 gap-4 mt-2">
                    <div className="bg-gray-100 p-3 rounded-lg text-center">
                      <p className="text-xs md:text-sm font-medium text-gray-600 uppercase">
                        {datosMesActual.nombreMes} {datosMesActual.anio}
                      </p>
                      <p className={`text-3xl md:text-4xl font-bold ${
                        parseFloat(datosMesActual.porcentaje) >= 100 
                          ? 'text-green-600' 
                          : parseFloat(datosMesActual.porcentaje) >= 80 
                          ? 'text-yellow-600' 
                          : 'text-red-600'
                      }`}>
                        {datosMesActual.porcentaje}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Porcentaje de Cumplimiento</p>
                    </div>
                  </div>

                  {/* Metas SF */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-200">
                      <p className="text-xs md:text-sm font-medium text-gray-600 uppercase">Meta SF</p>
                      <p className="text-xl md:text-2xl font-semibold text-blue-700">
                        {datosMesActual.metaSF.toLocaleString('es-MX')}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg text-center ${
                      datosMesActual.realSF >= datosMesActual.metaSF 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className="text-xs md:text-sm font-medium text-gray-600 uppercase">Real SF</p>
                      <p className={`text-xl md:text-2xl font-semibold ${
                        datosMesActual.realSF >= datosMesActual.metaSF 
                          ? 'text-green-700' 
                          : 'text-red-700'
                      }`}>
                        {datosMesActual.realSF.toLocaleString('es-MX')}
                      </p>
                    </div>
                  </div>

                  {/* Metas F */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-200">
                      <p className="text-xs md:text-sm font-medium text-gray-600 uppercase">Meta F</p>
                      <p className="text-xl md:text-2xl font-semibold text-blue-700">
                        {datosMesActual.metaF.toLocaleString('es-MX')}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg text-center ${
                      datosMesActual.realF >= datosMesActual.metaF 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className="text-xs md:text-sm font-medium text-gray-600 uppercase">Real F</p>
                      <p className={`text-xl md:text-2xl font-semibold ${
                        datosMesActual.realF >= datosMesActual.metaF 
                          ? 'text-green-700' 
                          : 'text-red-700'
                      }`}>
                        {datosMesActual.realF.toLocaleString('es-MX')}
                      </p>
                    </div>
                  </div>

                  {/* Totales */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-200">
                        <p className="text-xs md:text-sm font-medium text-gray-600 uppercase">Meta Total</p>
                        <p className="text-xl md:text-2xl font-semibold text-blue-700">
                          {datosMesActual.metaTotal.toLocaleString('es-MX')}
                        </p>
                      </div>
                      <div className="mt-1 text-center text-xs text-gray-500">
                        ({datosMesActual.metaSF.toLocaleString('es-MX')} + {datosMesActual.metaF.toLocaleString('es-MX')})
                      </div>
                    </div>
                    <div>
                      <div className={`p-3 rounded-lg text-center ${
                        datosMesActual.realTotal >= datosMesActual.metaTotal 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        <p className="text-xs md:text-sm font-medium text-gray-600 uppercase">Real Total</p>
                        <p className={`text-xl md:text-2xl font-semibold ${
                          datosMesActual.realTotal >= datosMesActual.metaTotal 
                            ? 'text-green-700' 
                            : 'text-red-700'
                        }`}>
                          {datosMesActual.realTotal.toLocaleString('es-MX')}
                        </p>
                      </div>
                      <div className="mt-1 text-center text-xs text-gray-500">
                        ({datosMesActual.realSF.toLocaleString('es-MX')} + {datosMesActual.realF.toLocaleString('es-MX')})
                      </div>
                    </div>
                  </div>

                  {/* Diferencia */}
                  <div className="grid grid-cols-1 gap-4 mt-4">
                    <div>
                      <div className={`p-3 rounded-lg text-center ${
                        datosMesActual.diferencia >= 0 ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'
                      }`}>
                        <p className="text-xs md:text-sm font-medium text-gray-600 uppercase">Diferencia</p>
                        <p className={`text-xl md:text-2xl font-semibold ${
                          datosMesActual.diferencia >= 0 ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {datosMesActual.diferencia >= 0 ? '+' : ''}{datosMesActual.diferencia.toLocaleString('es-MX')}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center mt-6">
                  <p className="text-yellow-700 font-semibold text-lg">
                    {anioSeleccionado === anioActual 
                      ? `No hay datos disponibles para ${new Date(anioActual, mesActual - 1).toLocaleDateString('es-ES', { month: 'long' })} ${anioSeleccionado}`
                      : `El mes actual no pertenece al año ${anioSeleccionado}`
                    }
                  </p>
                  <p className="text-yellow-600 mt-2 text-sm">
                    {anioSeleccionado !== anioActual 
                      ? 'Revisa los demás meses del año en las tarjetas de abajo'
                      : 'Verifica que existan registros en la base de datos'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card de la gráfica - CUMPLIMIENTO ANUAL */}
          <div className="hidden lg:block lg:col-span-7 mt-4 lg:mt-0">
            <div className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-semibold text-gray-500 mb-2 text-center uppercase">
                Cumplimiento Anual {anioSeleccionado}
              </h2>
              {porcentajesMensuales.length > 0 ? (
                <GraficaCumplimientoMensual datos={porcentajesMensuales} />
              ) : (
                <div className="h-[400px] flex items-center justify-center text-gray-400">
                  Sin datos para graficar
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sección de cards mensuales - OTROS MESES */}
        {otrosMeses.length > 0 && (
          <div className="mt-10">
            <Heading title={`Otros Meses del ${anioSeleccionado}`} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {otrosMeses.map((mes) => (
                <CardCumplimientoMensual key={mes.mes} mes={mes} />
              ))}
            </div>
          </div>
        )}

        {/* Mensaje si no hay otros meses */}
        {otrosMeses.length === 0 && porcentajesMensuales.length > 0 && (
          <div className="mt-10 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-blue-700 font-semibold">
              Solo hay datos del mes actual para el año {anioSeleccionado}
            </p>
          </div>
        )}

        {/* Mensaje si no hay datos del año */}
        {porcentajesMensuales.length === 0 && (
          <div className="mt-10 bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <p className="text-yellow-700 font-semibold text-lg">
              No hay datos disponibles para el año {anioSeleccionado}
            </p>
            <p className="text-yellow-600 mt-2">
              Selecciona otro año o verifica que existan registros en la base de datos
            </p>
          </div>
        )}
      </div>
    </>
  )
}

export default PorcentajeDeCumplimiento