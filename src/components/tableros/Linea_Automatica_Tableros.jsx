import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import clienteAxios from "../../../config/clienteAxios";
import TablaSurtidoMaquina from "../others/tables/TablaSurtidoMaquina";
import AreaSelect from "../others/html_personalizado/AreaSelect";
import Heading from "../others/Heading";
import { seccionesOrdenadas } from "../../../utilidades/SeccionesOrdenadas";
const Linea_Automatica_Tableros = () => {
  // Definimos las áreas con sus respectivos endpoints, nombres de sección 
  // y la lista de máquinas que se desea mostrar (filtro)
  const areas = [
    {
      key: "generado",
      title: "Resumen generado",
      metaEndpoint: "/metas/metas-generadores",
      dataEndpoint: "/generadores/generadores/actualdia",
      seccion: "Generado",
      filtro: ["245 ORBIT 1 LA", "246 ORBIT 2 LA", "244 ORBIT 3 LA", "243 ORBIT 4 LA"],
    },
    {
      key: "pulido",
      title: "Resumen pulido",
      metaEndpoint: "/metas/metas-pulidos",
      dataEndpoint: "/pulido/pulido/actualdia",
      seccion: "Pulido",
      filtro: ["266 MULTIFLEX 1", "267 MULTIFLEX 2", "268 MULTIFLEX 3", "269 MULTIFLEX 4"],
    },
    {
      key: "biselado",
      title: "Resumen Biselado",
      metaEndpoint: "/metas/metas-biselados",
      dataEndpoint: "/biselado/biselado/actualdia",
      seccion: "Biselado",
      filtro: [
        "228 DOUBLER 2",
        "229 DOUBLER 3",
        "230 DOUBLER 4",
        "231 DOUBLER 5",
        "232 DOUBLER 6",
        "298 DOUBLER",
        "312 RAZR",
        "318 HSE 1",
        "319 HSE 2"
      ],
    },
  ];
  // Estado para controlar el área activa
  const [activeArea, setActiveArea] = useState("generado");
  const currentArea = areas.find((area) => area.key === activeArea);
  // Estados para almacenar la data y las metas consultadas
  const [tableData, setTableData] = useState([]);
  const [metasMapping, setMetasMapping] = useState({});
  // Función para extraer el nombre base (quitando lo que sigue al guion)
  const extractBaseName = (name) => name.split("-")[0].trim();
  // Función que suma una hora a un string ("HH:MM")
  const addOneHour = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const nextHour = (hours + 1) % 24;
    return String(nextHour).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");
  };
  // Función para determinar a qué turno pertenece una hora:
  // Considera nocturno si la hora es ≥22 o <6, matutino si está entre 06:30 y 14:30 y vespertino en el resto.
  const getTurnWithTime = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    if (h >= 22 || h < 6) return "meta_nocturno";
    const totalMin = h * 60 + m;
    if (totalMin >= 390 && totalMin < 870) return "meta_matutino";
    return "meta_vespertino";
  };
  // Generador de columnas para el turno matutino (06:30 a 14:30)
  const generateMatutinoColumns = () => {
    const cols = [];
    for (let hour = 6; hour < 14; hour++) {
      const startStr = String(hour).padStart(2, "0") + ":30";
      const nextHour = (hour + 1) % 24;
      const header = `${startStr} - ${String(nextHour).padStart(2, "0")}:30`;
      cols.push({ header, accessor: `hour_${startStr}` });
    }
    return cols;
  };
  // Generador de columnas para el turno vespertino (14:30 a 22:30)
  const generateVespertinoColumns = () => {
    const cols = [];
    for (let hour = 14; hour < 22; hour++) {
      const startStr = String(hour).padStart(2, "0") + ":30";
      const nextHour = (hour + 1) % 24;
      const header = `${startStr} - ${String(nextHour).padStart(2, "0")}:30`;
      cols.push({ header, accessor: `hour_${startStr}` });
    }
    return cols;
  };
  // Generador de columnas para el turno nocturno (22:00 a 06:00)
  // Se generan columnas para las horas: 22, 23, 0, 1, 2, 3, 4, 5.
  const generateNocturnoColumns = () => {
    const cols = [];
    const hours = [22, 23, 0, 1, 2, 3, 4, 5];
    for (let h of hours) {
      const startStr = String(h).padStart(2, "0") + ":00";
      const header = `${startStr} - ${addOneHour(startStr)}`;
      cols.push({ header, accessor: `hour_${startStr}` });
    }
    return cols;
  };
  // Definición de las columnas fijas
  const fixedColumns = [
    { header: "Nombre", accessor: "nombre" },
    { header: "Total acumulado", accessor: "totalAcumulado" },
  ];
  // Generamos e invertimos las columnas para cada turno (mostrarlas de derecha a izquierda)
  const matutinoColumns = generateMatutinoColumns().reverse();
  const vespertinoColumns = generateVespertinoColumns().reverse();
  const nocturnoColumns = generateNocturnoColumns().reverse();
  // Reordenamos las columnas horarias (el orden se puede ajustar según lo requerido)
  const hourColumns = [...vespertinoColumns, ...matutinoColumns, ...nocturnoColumns];
  // Definición de la jornada: inicia a las 22:00 de un día y finaliza a las 22:00 del siguiente
  const currentTime = moment();
  let journeyStart = moment().set({ hour: 22, minute: 0, second: 0, millisecond: 0 });
  if (currentTime.isBefore(journeyStart)) {
    journeyStart.subtract(1, "day");
  }
  const journeyEnd = moment(journeyStart).add(1, "day");
  // Filtrar las columnas horarias para mostrar sólo aquellas cuyos intervalos ya hayan pasado
  const filteredHourColumns = hourColumns.filter((col) => {
    const timeStr = col.accessor.replace("hour_", "");
    const [h, m] = timeStr.split(":").map(Number);
    let colMoment = moment(journeyStart);
    if (h < 22) colMoment.add(1, "day");
    colMoment.set({ hour: h, minute: m, second: 0, millisecond: 0 });
    const intervalEnd = moment(colMoment).add(1, "hour");
    return currentTime.isSameOrAfter(intervalEnd);
  });
  const allColumns = [...fixedColumns, ...filteredHourColumns];
  const hourAccessors = filteredHourColumns.map((col) => col.accessor);
  // Función para calcular la meta acumulada a partir de las metas disponibles y las columnas de hora mostradas
  const computeMetaAcumulada = (metas, keys) => {
    return keys.reduce((total, key) => {
      const timeStr = key.replace("hour_", "");
      const turno = getTurnWithTime(timeStr);
      return total + Number(metas[turno] || 0);
    }, 0);
  };
  // Obtener la configuración de la sección según currentArea (usando seccionesOrdenadas)
  // En este ejemplo se usa para mostrar información complementaria, pero usaremos el arreglo "filtro"
  // definido en cada área para forzar la lista de máquinas.
  const sectionConfig = seccionesOrdenadas.find((s) => s.seccion === currentArea.seccion);
  // La lista de máquinas que se usará será la definida en el currentArea.filtro.
  const maquinasFiltro = currentArea.filtro;
  // useEffect para obtener las metas y los registros (datos) de la API según el área seleccionada
  useEffect(() => {
    // Reiniciamos la data cuando se cambia el área
    setTableData([]);
    setMetasMapping({});
    // Función para obtener las metas
    const fetchMetas = async () => {
      try {
        const response = await clienteAxios.get(currentArea.metaEndpoint);
        const registrosMetas = response.data.registros || [];
        const mapping = {};
        registrosMetas.forEach((reg) => {
          mapping[reg.name] = {
            meta_nocturno: reg.meta_nocturno,
            meta_matutino: reg.meta_matutino,
            meta_vespertino: reg.meta_vespertino,
          };
        });
        setMetasMapping(mapping);
      } catch (error) {
        console.error("Error al obtener las metas:", error);
      }
    };
    // Función para obtener y agrupar los datos
    const fetchData = async () => {
      try {
        const response = await clienteAxios.get(currentArea.dataEndpoint);
        const registros = response.data.registros || [];
        // Filtrar registros para la jornada actual
        const registrosFiltrados = registros.filter((reg) => {
          const recordMoment = moment(
            `${reg.fecha} ${reg.hour.slice(0, 5)}`,
            "YYYY-MM-DD HH:mm"
          );
          return recordMoment.isSameOrAfter(journeyStart) && recordMoment.isBefore(journeyEnd);
        });
        // Agrupar registros por máquina (según su nombre base)
        const agrupados = {};
        registrosFiltrados.forEach((reg) => {
          const baseName = extractBaseName(reg.name);
          if (!agrupados[baseName]) {
            agrupados[baseName] = { nombre: baseName, totalAcumulado: 0 };
          }
          agrupados[baseName].totalAcumulado += Number(reg.hits);
          const key = `hour_${reg.hour.slice(0, 5)}`;
          agrupados[baseName][key] = (agrupados[baseName][key] || 0) + Number(reg.hits);
        });
        const dataAgrupada = Object.values(agrupados);
        // Se fuerza el listado de máquinas a través del filtro, mostrando incluso las que no tengan registros
        const dataConMaquinasFijas = maquinasFiltro.map((maquina) => {
          const registroExistente = dataAgrupada.find(
            (reg) => reg.nombre.toUpperCase() === maquina.toUpperCase()
          );
          if (registroExistente) {
            return registroExistente;
          } else {
            const nuevoRegistro = { nombre: maquina, totalAcumulado: 0 };
            hourAccessors.forEach((key) => {
              nuevoRegistro[key] = 0;
            });
            return nuevoRegistro;
          }
        });
        setTableData(dataConMaquinasFijas);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };
    fetchMetas();
    fetchData();
  }, [activeArea]); // Se ejecuta cada vez que cambia el área activa
  // Construir la data final inyectando "metas" y "metaAcumulada"
  const finalFilteredData = useMemo(() => {
    return tableData.map((row) => {
      const metas = metasMapping[row.nombre] || {};
      const metaAcumulada =
        Object.keys(metas).length > 0 ? computeMetaAcumulada(metas, hourAccessors) : "";
      return { ...row, metaAcumulada, metas };
    });
  }, [tableData, metasMapping, hourAccessors]);
  // Calcular la fila total para cada columna
  const totalsRow = useMemo(() => {
    return allColumns.reduce((acc, col) => {
      if (col.accessor === "nombre") {
        acc[col.accessor] = "Totales";
      } else {
        acc[col.accessor] = finalFilteredData.reduce(
          (sum, row) => sum + Number(row[col.accessor] || 0),
          0
        );
      }
      return acc;
    }, {});
  }, [allColumns, finalFilteredData]);
  return (
    <div className="p-4">
      <Heading title="Línea Automática" />
      {/* Pestañas para seleccionar el área */}
      <div className="flex justify-center space-x-4 mb-4">
        {areas.map((area) => (
          <button
            key={area.key}
            className={`px-4 py-2 border rounded ${
              activeArea === area.key ? "bg-blue-500 text-white" : "bg-white text-black"
            }`}
            onClick={() => setActiveArea(area.key)}
          >
            {area.title}
          </button>
        ))}
      </div>
      <TablaSurtidoMaquina
        columns={allColumns}
        finalFilteredData={finalFilteredData}
        totalsRow={totalsRow}
      />
    </div>
  );
};
export default Linea_Automatica_Tableros;