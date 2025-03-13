import React, { useState, useEffect } from "react";
import moment from "moment";
import clienteAxios from "../../../config/clienteAxios";
import SelectWipDiario from "../../components/others/html_personalizado/SelectWipDiario";
import TablaHistorial from "../../components/others/tables/TablaHistorial";
import CardHistorial from "../../components/others/cards/CardHistorial";
import { seccionesOrdenadas } from "../../../utilidades/SeccionesOrdenadas";
import Alerta from "../../components/others/alertas/Alerta";
import Heading from "../../components/others/Heading";

const Historial_Por_Dia = () => {
  // Calcular la fecha de ayer para usarla como fecha por defecto
  const ayer = moment().subtract(1, "day");
  const defaultYear = ayer.year();
  const defaultMonth = ayer.month() + 1; // moment usa meses de 0 a 11
  const defaultDay = ayer.date();
  // Datos para los selectores
  const anios = [defaultYear, 2024];
  const meses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const dias = Array.from({ length: 31 }, (_, index) => index + 1);
  const anioOptions = anios.map((anio) => ({ value: anio, label: anio.toString() }));
  const mesOptions = meses.map((mes) => ({ value: mes, label: mes.toString() }));
  const diaOptions = dias.map((dia) => ({ value: dia, label: dia.toString() }));
  // Estados con la fecha seleccionada (por defecto, la de ayer)
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedDay, setSelectedDay] = useState(defaultDay);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metas, setMetas] = useState({});
  // Efecto para obtener registros del día seleccionado
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Se obtiene el historial para el día seleccionado
        const responseCurrent = await clienteAxios(
          `/historial/historial-2/${selectedYear}/${selectedMonth}/${selectedDay}`
        );
        // La API devuelve registros agrupados, se aplanan
        const currentRecords = Array.isArray(responseCurrent.data.registros)
          ? responseCurrent.data.registros
          : Object.values(responseCurrent.data.registros).flat();
        // Construir la fecha seleccionada en formato "YYYY-MM-DD"
        const selectedDate = moment(`${selectedYear}-${selectedMonth}-${selectedDay}`, "YYYY-M-D");
        // Filtrar los registros del día actual:
        // Se combinan record.fecha (que ya viene en "YYYY-MM-DD") y record.hour para obtener la marca temporal.
        const currentFiltered = currentRecords.filter((record) => {
          if (!record.fecha || !record.hour) return false;
          const recordMoment = moment(record.fecha + " " + record.hour, "YYYY-MM-DD HH:mm:ss");
          const esMismoDia = recordMoment.isSame(selectedDate, "day");
          // Omitir registros de hora "00:00"
          if (record.hour === "00:00" || record.hour === "00:00:00") return false;
          // Solo incluir los registros del día que ocurren antes de las 22:00
          if (esMismoDia && recordMoment.hour() >= 22) return false;
          return esMismoDia;
        });
        // Se obtienen registros del día anterior para cubrir el turno nocturno.
        const fechaAnterior = selectedDate.clone().subtract(1, "days");
        const prevYear = fechaAnterior.format("YYYY");
        const prevMonth = fechaAnterior.format("MM");
        const prevDay = fechaAnterior.format("DD");
        const prevEndpoint = `/historial/historial-2/${prevYear}/${prevMonth}/${prevDay}`;
        const responsePrev = await clienteAxios(prevEndpoint);
        const prevRecords = Array.isArray(responsePrev.data.registros)
          ? responsePrev.data.registros
          : Object.values(responsePrev.data.registros).flat();
        // Filtrar el turno nocturno: registros del día anterior posteriores a las 22:00.
        const prevRecordsFiltered = prevRecords.filter((record) => {
          if (!record.fecha || !record.hour) return false;
          const recordMoment = moment(record.fecha + " " + record.hour, "YYYY-MM-DD HH:mm:ss");
          const esMismoDiaPrev = recordMoment.isSame(fechaAnterior, "day");
          let adjustedHour = moment(record.hour, "HH:mm:ss");
          if (adjustedHour.hour() < 6) {
            adjustedHour.add(24, "hours");
          }
          return esMismoDiaPrev && adjustedHour.hour() >= 22;
        });
        const todosRegistros = [...prevRecordsFiltered, ...currentFiltered];
        setData({ registros: todosRegistros });
      } catch (err) {
        console.error(err);
        setError("Error al obtener los datos.");
      }
      setLoading(false);
    };
    fetchData();
  }, [selectedYear, selectedMonth, selectedDay]);
  // Efecto para obtener las metas (sin cambios)
  useEffect(() => {
    const obtenerMetas = async () => {
      try {
        const responseMetasTallados = await clienteAxios.get("/metas/metas-tallados");
        const responseMetasManuales = await clienteAxios.get("/metas/metas-manuales");
        const responseMetasGeneradores = await clienteAxios.get("/metas/metas-generadores");
        const responseMetasPulidos = await clienteAxios.get("/metas/metas-pulidos");
        const responseMetasEngravers = await clienteAxios.get("/metas/metas-engravers");
        const responseMetasTerminados = await clienteAxios.get("/metas/metas-terminados");
        const responseMetasBiselados = await clienteAxios.get("/metas/metas-biselados");
        const metasTallados = responseMetasTallados.data.registros.reduce((acc, curr) => {
          acc[curr.name.trim()] = curr.meta;
          return acc;
        }, {});
        const metasManuales = responseMetasManuales.data.registros.reduce((acc, curr) => {
          acc[curr.name.trim()] = curr.meta;
          return acc;
        }, {});
        const metasGeneradores = responseMetasGeneradores.data.registros.reduce((acc, curr) => {
          acc[curr.name.trim()] = curr.meta;
          return acc;
        }, {});
        const metasPulidos = responseMetasPulidos.data.registros.reduce((acc, curr) => {
          acc[curr.name.trim()] = curr.meta;
          return acc;
        }, {});
        const metasEngravers = responseMetasEngravers.data.registros.reduce((acc, curr) => {
          acc[curr.name.trim()] = curr.meta;
          return acc;
        }, {});
        const metasTerminados = responseMetasTerminados.data.registros.reduce((acc, curr) => {
          acc[curr.name.trim()] = curr.meta;
          return acc;
        }, {});
        const metasBiselados = responseMetasBiselados.data.registros.reduce((acc, curr) => {
          acc[curr.name.trim()] = curr.meta;
          return acc;
        }, {});
        setMetas({
          ...metasTallados,
          ...metasGeneradores,
          ...metasPulidos,
          ...metasEngravers,
          ...metasTerminados,
          ...metasBiselados,
          ...metasManuales,
        });
      } catch (error) {
        console.error("Error al obtener las metas:", error);
      }
    };
    obtenerMetas();
  }, [selectedYear, selectedMonth, selectedDay]);
  // Agrupar los registros según las secciones definidas
  const seccionesAgrupadas = data?.registros
    ? seccionesOrdenadas.map(({ seccion, nombres }) => {
        const items = data.registros.filter((item) => nombres.includes(item.name));
        return { seccion, nombres, items };
      })
    : [];
  // Para mostrar en pantalla el rango de jornada:
  // - Inicio: día anterior al seleccionado a las 22:00.
  // - Fin: día seleccionado a las 21:59.
  const selectedDate = moment(`${selectedYear}-${selectedMonth}-${selectedDay}`, "YYYY-M-D");
  const inicioJornada = selectedDate.clone().subtract(1, "day").set({ hour: 22, minute: 0, second: 0 });
  const finJornada = selectedDate.clone().set({ hour: 21, minute: 59, second: 59 });
  const displayRange = `Rango de fecha: ${inicioJornada.format("YYYY-MM-DD HH:mm")} - ${finJornada.format("YYYY-MM-DD HH:mm")}`;
  return (
    <div className="p-8 py-0 bg-gray-100 min-h-screen">
        <Heading title={'Historial produccion por dia'}/>
      {/* Selectores */}
      <div className="mb-6 flex flex-wrap gap-4 justify-center">
        <div className="w-80">
          <SelectWipDiario
            options={anioOptions}
            value={anioOptions.find((option) => option.value === selectedYear)}
            onChange={(option) => setSelectedYear(option.value)}
            placeholder="Selecciona Año"
          />
        </div>
        <div className="w-80">
          <SelectWipDiario
            options={mesOptions}
            value={mesOptions.find((option) => option.value === selectedMonth)}
            onChange={(option) => setSelectedMonth(option.value)}
            placeholder="Selecciona Mes"
          />
        </div>
        <div className="w-80">
          <SelectWipDiario
            options={diaOptions}
            value={diaOptions.find((option) => option.value === selectedDay)}
            onChange={(option) => setSelectedDay(option.value)}
            placeholder="Selecciona Día"
          />
        </div>
      </div>
      {/* Leyenda con el rango de jornada */}
      <div className="text-center mb-4 text-sm text-gray-500 hidden lg:block">
        {displayRange}
      </div>
      {loading && <p className="text-center text-gray-700">Cargando datos...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!loading && !error && data && data.registros.length === 0 && (
        <Alerta message="No se encontraron registros para la fecha seleccionada." type="error" />
      )}
      {!loading && !error && data && data.registros.length > 0 && (
        <>
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-6">
            {seccionesAgrupadas.map(({ seccion, nombres, items }) => {
              if (items.length === 0) return null;
              return (
                <TablaHistorial
                  key={seccion}
                  seccion={seccion}
                  nombres={nombres}
                  items={items}
                  metas={metas}
                />
              );
            })}
          </div>
          <div className="md:hidden">
            <CardHistorial
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              selectedDay={selectedDay}
              registros={data.registros}
              metas={metas}
            />
          </div>
        </>
      )}
    </div>
  );
};
export default Historial_Por_Dia;