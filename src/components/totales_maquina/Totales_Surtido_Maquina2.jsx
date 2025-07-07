import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import Heading from "../others/Heading";
import clienteAxios from "../../../config/clienteAxios";
import TablaSurtidoMaquina from "../others/tables/TablaSurtidoMaquina";
import AreaSelect from "../others/html_personalizado/AreaSelect";
// Función para extraer el nombre base (separa por guion) y agrupar estaciones
const extractBaseName = (name) => name.split("-")[0].trim();
// Función que suma una hora a un string con formato "HH:MM"
const addOneHour = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const nextHour = (hours + 1) % 24;
  return String(nextHour).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");
};
// Función getTurnWithTime para diferenciar los turnos:
// Se considera nocturno si la hora es ≥22 o <6; entre 06:30 y 14:30 es matutino; el resto es vespertino.
const getTurnWithTime = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  if (h >= 22 || h < 6) {
    return "meta_nocturno";
  }
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
const Totales_Surtido_Maquina2 = () => {
  const [tableData, setTableData] = useState([]);
  const [metasMapping, setMetasMapping] = useState({});
  // Los registros de interés deben comenzar con "19 LENS LOG" o "20 LENS LOG"
  const validPrefixes = ["19 LENS LOG", "20 LENS LOG"];
  // Columnas fijas (Nombre y Total acumulado)
  const fixedColumns = [
    { header: "Nombre", accessor: "nombre" },
    { header: "Total acumulado", accessor: "totalAcumulado" }
  ];
  // Generar e invertir las columnas de cada turno (para mostrarlas de derecha a izquierda)
  const matutinoColumns = generateMatutinoColumns().reverse();
  const vespertinoColumns = generateVespertinoColumns().reverse();
  const nocturnoColumns = generateNocturnoColumns().reverse();
  // Reordenar columnas en el orden deseado: en LTR => vespertino, matutino, nocturno.
  const hourColumns = [...vespertinoColumns, ...matutinoColumns, ...nocturnoColumns];
  // Filtrar intervalos ya cumplidos.
  const currentTime = moment();
  const filteredHourColumns = hourColumns.filter((col) => {
    if (!col.accessor.startsWith("hour_")) return true;
    const startStr = col.accessor.replace("hour_", "");
    const [h, m] = startStr.split(":").map(Number);
    const turno = getTurnWithTime(startStr);
    let intervalEnd;
    if (turno === "meta_nocturno") {
      if (h >= 22) {
        intervalEnd = moment().subtract(1, "day").set({ hour: h, minute: m, second: 0, millisecond: 0 }).add(1, "hour");
      } else {
        intervalEnd = moment().set({ hour: h, minute: m, second: 0, millisecond: 0 }).add(1, "hour");
      }
    } else {
      intervalEnd = moment().set({ hour: h, minute: m, second: 0, millisecond: 0 }).add(1, "hour");
    }
    return currentTime.isSameOrAfter(intervalEnd);
  });
  // Combinamos las columnas fijas con las de intervalos ya filtrados
  const allColumns = [...fixedColumns, ...filteredHourColumns];
  const hourAccessors = filteredHourColumns.map((col) => col.accessor);
  // Obtener las metas (endpoint "metas/metas-manuales"), filtrando por registros cuyo name comience con los prefijos válidos
  useEffect(() => {
    const fetchMetas = async () => {
      try {
        const response = await clienteAxios.get("metas/metas-manuales");
        const registrosMetas = response.data.registros || [];
        // Filtrar usando startsWith para ver si el name comienza con "19 LENS LOG" o "20 LENS LOG"
        const registrosFiltrados = registrosMetas.filter((reg) =>
          validPrefixes.some(prefix => reg.name.startsWith(prefix))
        );
        console.log("Metas filtradas:", registrosFiltrados);
        const mapping = {};
        registrosFiltrados.forEach((reg) => {
          // Al extraer el nombre base, se obtendrá "19 LENS LOG" o "20 LENS LOG"
          const base = extractBaseName(reg.name);
          mapping[base] = {
            meta_nocturno: reg.meta_nocturno,
            meta_matutino: reg.meta_matutino,
            meta_vespertino: reg.meta_vespertino
          };
        });
        setMetasMapping(mapping);
      } catch (error) {
        console.error("Error al obtener las metas manuales:", error);
      }
    };
    fetchMetas();
  }, []);
  // Obtener y agrupar registros (endpoint "/manual/manual/actualdia")
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await clienteAxios.get("/manual/manual/actualdia");
        const registros = response.data.registros || [];
        // Filtrar por registros cuyo name comience con los prefijos válidos
        const registrosPorNombre = registros.filter((reg) =>
          validPrefixes.some(prefix => reg.name.startsWith(prefix))
        );
        
        const currentDateStr = moment().format("YYYY-MM-DD");
        const yesterdayDateStr = moment().subtract(1, "days").format("YYYY-MM-DD");
        
        // Filtrar por fecha: día actual o, de ayer, si la hora ≥ "22:00"
        const registrosFiltrados = registrosPorNombre.filter((reg) => {
          if (reg.fecha === currentDateStr) return true;
          if (reg.fecha === yesterdayDateStr && reg.hour.slice(0, 5) >= "22:00") return true;
          return false;
        });
        
        // Agrupar registros usando extractBaseName (esto nos dará "19 LENS LOG" o "20 LENS LOG")
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
        // Lista predefinida de máquinas para este área
        const maquinasArea = [
          "19 LENS LOG",
          "20 LENS LOG"
          // Puedes agregar más nombres, en el orden deseado, si fuera necesario
        ];
        // Obtenemos los registros agrupados en un array
        const dataAgrupada = Object.values(agrupados);
        // Recorremos la lista predefinida y, si no existe registro, se crea uno con valores por defecto.
        const dataConMaquinasFijas = maquinasArea.map((maquina) => {
          // Buscamos la máquina en los datos agrupados (usando comparación en minúsculas para evitar problemas)
          const registroExistente = dataAgrupada.find(
            (reg) => reg.nombre.toLowerCase() === maquina.toLowerCase()
          );
          if (registroExistente) {
            return registroExistente;
          } else {
            // Creamos el registro con valores iniciales
            const nuevoRegistro = { nombre: maquina, totalAcumulado: 0 };
            // Inicializamos cada columna horaria en 0 según hourAccessors
            hourAccessors.forEach((key) => {
              nuevoRegistro[key] = 0;
            });
            return nuevoRegistro;
          }
        });
        
        console.log("Datos agrupados con máquinas fijas:", dataConMaquinasFijas);
        setTableData(dataConMaquinasFijas);
      } catch (error) {
        console.error("Error al consultar la API de manuales:", error);
      }
    };
    fetchData();
  }, [hourAccessors]);
  // Función para calcular la meta acumulada por columna según turno
  const computeMetaAcumulada = (metas, columnKeys) => {
    return columnKeys.reduce((total, key) => {
      const timeStr = key.replace("hour_", "");
      const turno = getTurnWithTime(timeStr);
      return total + Number(metas[turno] || 0);
    }, 0);
  };
  // Construir la data final inyectando "metas" y "metaAcumulada"
  const finalFilteredData = useMemo(() => {
    return tableData.map((row) => {
      const metas = metasMapping[row.nombre] || {};
      const metaAcumulada =
        Object.keys(metas).length > 0 ? computeMetaAcumulada(metas, hourAccessors) : "";
      return { ...row, metaAcumulada, metas };
    });
  }, [tableData, metasMapping, hourAccessors]);
  // Calcular la fila de totales por columna
  const totalsRow = useMemo(() => {
    return allColumns.reduce((acc, col) => {
      if (col.accessor === "nombre") {
        acc[col.accessor] = "Totales";
      } else {
        acc[col.accessor] = finalFilteredData.reduce((sum, row) => {
          return sum + Number(row[col.accessor] || 0);
        }, 0);
      }
      return acc;
    }, {});
  }, [allColumns, finalFilteredData]);
  return (
    <div className="p-4">
      <Heading title="Resumen Surtido" />
      <AreaSelect />
      <TablaSurtidoMaquina
        columns={allColumns}
        finalFilteredData={finalFilteredData}
        totalsRow={totalsRow}
      />
    </div>
  );
};
export default Totales_Surtido_Maquina2;