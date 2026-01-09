import React, { useState, useEffect } from "react";
import moment from "moment";
import clienteAxios from "../../../config/clienteAxios";
import SelectWipDiario from "../../components/others/html_personalizado/SelectWipDiario";
import TablaHistorialRangos from "../../components/others/tables/TablaHistorialRangos";
import CardHistorialRangos from "../../components/others/cards/CardHistorialRangos";
import Alerta from "../../components/others/alertas/Alerta";
import { seccionesOrdenadas } from "../../../utilidades/SeccionesOrdenadas";
import Heading from "../../components/others/Heading";

const Historial_Por_Rangos = () => {
  // Fechas por defecto: se usa ayer como fecha de fin y anteayer como fecha de inicio.
  const defaultEnd = moment().subtract(1, "day");
  const defaultStart = moment().subtract(2, "day");
  // Datos para los selectores
  const currentYear = moment().year();
  const anios = [currentYear - 2, currentYear - 1, currentYear];
  const meses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const dias = Array.from({ length: 31 }, (_, index) => index + 1);
  const anioOptions = anios.map((anio) => ({ value: anio, label: anio.toString() }));
  const mesOptions = meses.map((mes) => ({ value: mes, label: mes.toString() }));
  const diaOptions = dias.map((dia) => ({ value: dia, label: dia.toString() }));
  // Estados para la FECHA DE INICIO
  const [startYear, setStartYear] = useState(defaultStart.year());
  const [startMonth, setStartMonth] = useState(defaultStart.month() + 1);
  const [startDay, setStartDay] = useState(defaultStart.date());
  // Estados para la FECHA DE FIN
  const [endYear, setEndYear] = useState(defaultEnd.year());
  const [endMonth, setEndMonth] = useState(defaultEnd.month() + 1);
  const [endDay, setEndDay] = useState(defaultEnd.date());
  // Estados para la información y errores
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // En el render, se calcula el rango para mostrar en pantalla, pero para el efecto
  // lo calcularemos dentro de este bloque para evitar loop infinito.
  let displayRange = "";
  {
    const fechaInicio = moment(`${startYear}-${startMonth}-${startDay}`, "YYYY-M-D");
    const fechaFin = moment(`${endYear}-${endMonth}-${endDay}`, "YYYY-M-D");
    const inicioJornada = fechaInicio.clone().subtract(1, "day").set({ hour: 22, minute: 0, second: 0 });
    const finJornada = fechaFin.clone().set({ hour: 21, minute: 59, second: 59 });
    displayRange = `Rango de fecha: ${inicioJornada.format("YYYY-MM-DD HH:mm")} - ${finJornada.format("YYYY-MM-DD HH:mm")}`;
  }
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fechaInicio = moment(`${startYear}-${startMonth}-${startDay}`, "YYYY-M-D");
        const fechaFin = moment(`${endYear}-${endMonth}-${endDay}`, "YYYY-M-D");
        // Calculamos los límites de la jornada laboral dentro del efecto
        const inicioJornada = fechaInicio.clone().subtract(1, "day").set({ hour: 22, minute: 0, second: 0 });
        const finJornada = fechaFin.clone().set({ hour: 21, minute: 59, second: 59 });
        // Consultamos el endpoint usando días completos
        const fechaInicioEffective = fechaInicio.clone().subtract(1, "day");
        const fechaFinEffective = fechaFin.clone();
        const response = await clienteAxios(
          `/historial/historial-3/${fechaInicioEffective.year()}/${fechaInicioEffective.month() + 1}/${fechaInicioEffective.date()}/${fechaFinEffective.year()}/${fechaFinEffective.month() + 1}/${fechaFinEffective.date()}`
        );
        // Filtrar registros: combinamos 'fecha' y 'hour' (la fecha viene "YYYYMMDD")
        const filteredData = { registros: {} };
        if (response.data && response.data.registros) {
          Object.entries(response.data.registros).forEach(([modelo, records]) => {
            filteredData.registros[modelo] = records.filter((record) => {
              const recordMoment = moment(record.fecha + " " + record.hour, "YYYYMMDD HH:mm:ss");
              return recordMoment.isSameOrAfter(inicioJornada) && recordMoment.isSameOrBefore(finJornada);
            });
          });
          setData(filteredData);
        } else {
          setData(response.data);
        }
      } catch (err) {
        console.error(err);
        setError("Error al obtener los datos.");
      }
      setLoading(false);
    };
    fetchData();
    // Solo dependemos de las fechas (startYear, etc.)
  }, [startYear, startMonth, startDay, endYear, endMonth, endDay]);
  // Para móviles se aplanan todos los registros en un solo array.
  const registrosFlat = data ? Object.values(data.registros).flat() : [];
  // Agrupación para modo escritorio por secciones (si se usan)
  const allRecords = data ? Object.values(data.registros).flat() : [];
  const seccionesAgrupadas =
    allRecords.length > 0
      ? seccionesOrdenadas
          .map(({ seccion, nombres }) => {
            const items = allRecords.filter((item) => nombres.includes(item.name));
            return { seccion, nombres, items };
          })
          .filter(({ items }) => items.length > 0)
      : [];
  return (
    <div className="px-8 bg-gray-100 min-h-screen">
        <Heading title={'Historial produccion por rangos'}/>
      {/* Selectores */}
      <div className="mb-6 flex flex-col md:flex-row gap-6 justify-center">
        {/* Fecha de Inicio */}
        <div className="p-4 flex-1">
          <h3 className="text-center font-semibold text-lg mb-4 text-gray-500 uppercase">Fecha de Inicio</h3>
          <div className="flex flex-row gap-4">
            <div className="flex-1">
              <SelectWipDiario
                options={anioOptions}
                value={anioOptions.find((o) => o.value === startYear)}
                onChange={(o) => setStartYear(o.value)}
                placeholder="Año"
              />
            </div>
            <div className="flex-1">
              <SelectWipDiario
                options={mesOptions}
                value={mesOptions.find((o) => o.value === startMonth)}
                onChange={(o) => setStartMonth(o.value)}
                placeholder="Mes"
              />
            </div>
            <div className="flex-1">
              <SelectWipDiario
                options={diaOptions}
                value={diaOptions.find((o) => o.value === startDay)}
                onChange={(o) => setStartDay(o.value)}
                placeholder="Día"
              />
            </div>
          </div>
        </div>
        {/* Fecha de Fin */}
        <div className="p-4 flex-1">
          <h3 className="text-center font-semibold text-lg mb-4 text-gray-500 uppercase">Fecha de Fin</h3>
          <div className="flex flex-row gap-4">
            <div className="flex-1">
              <SelectWipDiario
                options={anioOptions}
                value={anioOptions.find((o) => o.value === endYear)}
                onChange={(o) => setEndYear(o.value)}
                placeholder="Año"
              />
            </div>
            <div className="flex-1">
              <SelectWipDiario
                options={mesOptions}
                value={mesOptions.find((o) => o.value === endMonth)}
                onChange={(o) => setEndMonth(o.value)}
                placeholder="Mes"
              />
            </div>
            <div className="flex-1">
              <SelectWipDiario
                options={diaOptions}
                value={diaOptions.find((o) => o.value === endDay)}
                onChange={(o) => setEndDay(o.value)}
                placeholder="Día"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Texto mostrando el rango de jornada */}
      <div className="text-center mb-4 text-sm text-gray-500 hidden lg:block">
        {displayRange}
      </div>
      {loading && <p className="text-center text-gray-700">Cargando datos...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {/* Vista para escritorio */}
      {!loading && !error && data && seccionesAgrupadas.length === 0 && (
        <Alerta message="No se encontraron registros para el rango seleccionado." type="error" />
      )}
      {!loading && !error && data && seccionesAgrupadas.length > 0 && (
        <>
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-6">
            {seccionesAgrupadas.map(({ seccion, nombres, items }) => (
              <TablaHistorialRangos key={seccion} seccion={seccion} nombres={nombres} items={items} />
            ))}
          </div>
          <div className="md:hidden">
            <CardHistorialRangos
              selectedYear={startYear}
              selectedMonth={startMonth}
              selectedDay={startDay}
              registros={registrosFlat}
            />
          </div>
        </>
      )}
    </div>
  );
};
export default Historial_Por_Rangos;