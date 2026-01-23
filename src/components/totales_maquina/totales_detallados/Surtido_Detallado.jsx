import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment-timezone';
import clienteAxios from '../../../../config/clienteAxios';
import Heading from '../../others/Heading';
import Actualizacion from '../../others/Actualizacion';
import SelectAnioMesDia from '../../others/html_personalizado/SelectAnioMesDia';
import { groupByHour, TurnoTable } from './Surtido_Helpers';
import Totales_Produccion_Tableros from '../../tableros/Totales_Produccion_Tableros';
// Cabecera de la tabla
const columns = [
  { header: 'Hora', accessor: 'hora' },
  { header: 'Hits / Meta', accessor: 'totalHits' }
];
const Surtido_Detallado = () => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dataNocturno, setDataNocturno] = useState([]);
  const [dataMatutino, setDataMatutino] = useState([]);
  const [dataVespertino, setDataVespertino] = useState([]);
  const [ultimoGrupo, setUltimoGrupo] = useState(null);
  const [metaTotal, setMetaTotal] = useState(null); 
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [vistaActiva, setVistaActiva] = useState("surtido");
  const [contador, setContador] = useState(30);
  const currentTime = moment.tz("America/Mexico_City");
  // Usamos una ref para mantener estable el contenedor fullscreen
  const fullscreenRef = useRef(null);
  // Efecto para intercalar entre vistas cada 30 segundos en fullscreen
  useEffect(() => {
    if (isFullScreen) {
      const interval = setInterval(() => {
        setContador(prev => {
          if (prev <= 1) {
            setVistaActiva(prevVista => prevVista === "surtido" ? "produccion" : "surtido");
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isFullScreen]);
  // Inicializamos los selectores de fecha
  useEffect(() => {
    const now = new Date();
    setSelectedYear({ value: now.getFullYear(), label: String(now.getFullYear()) });
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    setSelectedMonth({ value: currentMonth, label: moment(now).format('MMMM') });
    setSelectedDay({ value: now.getDate(), label: String(now.getDate()) });
  }, []);
  // Consumimos el endpoint de metas
  useEffect(() => {
    const fetchMetas = async () => {
      try {
        const response = await clienteAxios.get("/metas/metas-manuales");
        const metas = Array.isArray(response.data.registros)
          ? response.data.registros
          : [];
        const metasFiltradas = metas.filter(m =>
          m.name.includes("19 LENS LOG") || m.name.includes("20 LENS LOG")
        );
        const sumaMeta = metasFiltradas.reduce((acc, curr) => acc + Number(curr.meta || 0), 0);
        setMetaTotal(sumaMeta);
        console.log("Meta total obtenida:", sumaMeta);
      } catch (error) {
        console.error("Error al consumir el endpoint de metas:", error);
      }
    };
    fetchMetas();
  }, []);
  // Función para obtener los registros de datos sin recargar la página
  const fetchData = async () => {
    if (selectedYear && selectedMonth && selectedDay) {
      try {
        const endpoint = `/manual/manual/surtido_detallado/${selectedYear.value}/${selectedMonth.value}/${selectedDay.value}`;
        const response = await clienteAxios.get(endpoint);
        const registros = response.data.registros || [];
        console.log('Datos recibidos:', registros);
        const fechaSeleccionada = moment.tz(
          `${selectedYear.value}-${selectedMonth.value}-${selectedDay.value}`,
          "YYYY-M-D",
          "America/Mexico_City"
        ).format("YYYY-MM-DD");
        const fechaAnterior = moment(fechaSeleccionada)
          .subtract(1, 'days')
          .format("YYYY-MM-DD");
        let nocturno = [];
        let matutino = [];
        let vespertino = [];
        registros.forEach((registro) => {
          if (
            registro.name &&
            (registro.name.includes("19 LENS LOG-SF") ||
             registro.name.includes("20 LENS LOG-FIN") ||
             registro.name.includes("19 LENS LOG") ||
             registro.name.includes("20 LENS LOG"))
          ) {
            const fechaRegistro = registro.fecha;
            const horaRegistro = registro.hour;
            const [h, m] = horaRegistro.split(':').map(Number);
            const totalMinutos = h * 60 + m;
            if (fechaRegistro === fechaAnterior && totalMinutos >= 1320) {
              nocturno.push({ ...registro, rawHour: registro.hour });
            } else if (fechaRegistro === fechaSeleccionada) {
              if (totalMinutos < 390) {
                nocturno.push({ ...registro, rawHour: registro.hour });
              } else if (totalMinutos >= 390 && totalMinutos <= 869) {
                matutino.push({ ...registro, rawHour: registro.hour });
              } else if (totalMinutos >= 870 && totalMinutos <= 1319) {
                vespertino.push({ ...registro, rawHour: registro.hour });
              }
            }
          }
        });
        const agrupadoNocturno = groupByHour(nocturno, true);
        const agrupadoMatutino = groupByHour(matutino, false);
        const agrupadoVespertino = groupByHour(vespertino, false);
        setDataNocturno(agrupadoNocturno);
        setDataMatutino(agrupadoMatutino);
        setDataVespertino(agrupadoVespertino);
        // Combinamos los grupos y filtramos hasta el momento actual.
        const allGroups = [...agrupadoNocturno, ...agrupadoMatutino, ...agrupadoVespertino];
        const gruposValidos = allGroups.filter(grupo => grupo.sortKey.isBefore(currentTime));
        if (gruposValidos.length > 0) {
          const ultimo = gruposValidos.reduce(
            (max, curr) => (!max || curr.sortKey.isAfter(max.sortKey) ? curr : max),
            null
          );
          setUltimoGrupo(ultimo);
        } else {
          setUltimoGrupo(null);
        }
      } catch (error) {
        console.error("Error al consumir la API:", error);
      }
    }
  };
  // Llamada inicial y actualización de datos cada 2 minutos sin recargar la página
  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedMonth, selectedDay]);
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchData();
    }, 120000);
    return () => clearInterval(intervalId);
  }, [selectedYear, selectedMonth, selectedDay]);
  const computedFechaSeleccionada = selectedYear && selectedMonth && selectedDay
    ? moment.tz(
        `${selectedYear.value}-${selectedMonth.value}-${selectedDay.value}`,
        "YYYY-M-D",
        "America/Mexico_City"
      ).format("YYYY-MM-DD")
    : "";
  const computedFechaAnterior = computedFechaSeleccionada
    ? moment(computedFechaSeleccionada).subtract(1, 'days').format("YYYY-MM-DD")
    : "";
  // Configuramos los tiempos por turno
  const nocturnoStart = computedFechaAnterior
    ? moment.tz(`${computedFechaAnterior} 22:00`, "YYYY-MM-DD HH:mm", "America/Mexico_City")
    : null;
  const nocturnoEnd = computedFechaSeleccionada
    ? moment.tz(`${computedFechaSeleccionada} 06:30`, "YYYY-MM-DD HH:mm", "America/Mexico_City")
    : null;
  const matutinoStart = computedFechaSeleccionada
    ? moment.tz(`${computedFechaSeleccionada} 06:30`, "YYYY-MM-DD HH:mm", "America/Mexico_City")
    : null;
  const matutinoEnd = computedFechaSeleccionada
    ? moment.tz(`${computedFechaSeleccionada} 14:30`, "YYYY-MM-DD HH:mm", "America/Mexico_City")
    : null;
  const vespertinoStart = computedFechaSeleccionada
    ? moment.tz(`${computedFechaSeleccionada} 14:30`, "YYYY-MM-DD HH:mm", "America/Mexico_City")
    : null;
  const vespertinoEnd = computedFechaSeleccionada
    ? moment.tz(`${computedFechaSeleccionada} 22:00`, "YYYY-MM-DD HH:mm", "America/Mexico_City")
    : null;
  // Renderizado de las tablas por turno
  const renderTurnoTables = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-center uppercase text-gray-500">
          Turno Nocturno
        </h3>
        <TurnoTable
          turno="turno nocturno"
          data={dataNocturno}
          metaTotal={metaTotal}
          start={nocturnoStart}
          end={nocturnoEnd}
          currentTime={currentTime}
          columns={columns}
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2 text-center uppercase text-gray-500">
          Turno Matutino
        </h3>
        <TurnoTable
          turno="turno matutino"
          data={dataMatutino}
          metaTotal={metaTotal}
          start={matutinoStart}
          end={matutinoEnd}
          currentTime={currentTime}
          columns={columns}
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2 text-center uppercase text-gray-500">
          Turno Vespertino
        </h3>
        <TurnoTable
          turno="turno vespertino"
          data={dataVespertino}
          metaTotal={metaTotal}
          start={vespertinoStart}
          end={vespertinoEnd}
          currentTime={currentTime}
          columns={columns}
        />
      </div>
    </div>
  );
  // Manejo del cambio en fullscreen
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement !== null);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);
  // Función para activar/desactivar fullscreen usando la ref, evitando que el elemento se remonte
  const togglePantallaCompleta = () => {
    if (!document.fullscreenElement) {
      if (fullscreenRef.current.requestFullscreen) {
        fullscreenRef.current.requestFullscreen();
      } else if (fullscreenRef.current.mozRequestFullScreen) {
        fullscreenRef.current.mozRequestFullScreen();
      } else if (fullscreenRef.current.webkitRequestFullscreen) {
        fullscreenRef.current.webkitRequestFullscreen();
      } else if (fullscreenRef.current.msRequestFullscreen) {
        fullscreenRef.current.msRequestFullscreen();
      }
    } else {
      document.exitFullscreen();
    }
  };
  return (
    <>
      <div className="mt-6 md:mt-0">
        <Heading title="Surtido Detallado" />
      </div>
      <Actualizacion />
      <div className="p-4 bg-white mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="md:w-1/2">
            <SelectAnioMesDia
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              selectedDay={selectedDay}
              setSelectedYear={setSelectedYear}
              setSelectedMonth={setSelectedMonth}
              setSelectedDay={setSelectedDay}
            />
            {computedFechaSeleccionada && computedFechaAnterior && (
              <div className="text-center mt-4 text-gray-500">
                <small>
                  Rango de fecha: {computedFechaAnterior} 22:00 - {computedFechaSeleccionada} 21:59
                </small>
              </div>
            )}
          </div>
          <div className="mt-4 md:mt-0 md:w-1/2 flex justify-end">
            {ultimoGrupo && (
              <div className="flex items-center bg-indigo-50 border border-indigo-200 rounded-lg shadow-lg p-4 max-w-sm w-full">
                <div className="mr-4">
                  <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4a8 8 0 100 16 8 8 0 000-16z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-bold text-indigo-600">Último registro</p>
                  <p className="text-gray-700">
                    {ultimoGrupo.range} (<span className="font-semibold">{ultimoGrupo.totalHits} hits</span>)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mb-6">
        <button
          onClick={togglePantallaCompleta}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          Pantalla Completa
        </button>
      </div>
      <div
        id="componente-activo"
        ref={fullscreenRef}
        style={{
          display: isFullScreen ? 'flex' : 'block',
          justifyContent: isFullScreen ? 'center' : 'initial',
          alignItems: isFullScreen ? 'center' : 'initial',
          height: isFullScreen ? '100vh' : 'auto',
          width: isFullScreen ? '100%' : 'auto',
          position: 'relative'
        }}
        className={`p-4 ${isFullScreen ? 'bg-black' : 'bg-white'}`}
      >
        {isFullScreen && (
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              fontSize: "20px",
              fontWeight: "bold",
              color: "#FFF",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              padding: "10px 15px",
              borderRadius: "5px",
            }}
          >
            Cambio en: {contador}s
          </div>
        )}
        {vistaActiva === "surtido" ? (
          <>
            {renderTurnoTables()}
          </>
        ) : (
          <Totales_Produccion_Tableros />
        )}
      </div>
    </>
  );
};
export default Surtido_Detallado;