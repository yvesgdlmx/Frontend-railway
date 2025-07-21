import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import Heading from "../others/Heading";
import clienteAxios from "../../../config/clienteAxios";
import TablaSurtidoMaquina from "../others/tables/TablaSurtidoMaquina";
import AreaSelect from "../others/html_personalizado/AreaSelect";
import { seccionesOrdenadas } from "../../../utilidades/SeccionesOrdenadas";
// Función para extraer el nombre base (se separa por guion) y agrupar estaciones
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
const Totales_AR_Maquina2 = () => {
  const [tableData, setTableData] = useState([]);
  // Los registros de interés deben comenzar con alguno de los siguientes prefijos:
  const validPrefixes = [
    "52 FUSION",
    "53 1200 D",
    "54 OAC.120",
    "55 TLF 1200.1",
    "56 TLF 1200.2"
  ];
  // Columnas fijas (Nombre y Total acumulado)
  const fixedColumns = [
    { header: "Nombre", accessor: "nombre" },
    { header: "Total acumulado", accessor: "totalAcumulado" }
  ];
  // Generar e invertir las columnas de cada turno para mostrarlas de derecha a izquierda
  const matutinoColumns = generateMatutinoColumns().reverse();
  const vespertinoColumns = generateVespertinoColumns().reverse();
  const nocturnoColumns = generateNocturnoColumns().reverse();
  // Reordenar columnas: en entorno LTR se concatenan en este orden: vespertino, matutino, nocturno.
  const hourColumns = [...vespertinoColumns, ...matutinoColumns, ...nocturnoColumns];
  // Definir los límites de la jornada:
  // La jornada inicia a las 22:00 de un día y finaliza a las 22:00 del día siguiente.
  const currentTime = moment();
  let journeyStart = moment().set({ hour: 22, minute: 0, second: 0, millisecond: 0 });
  if (currentTime.isBefore(journeyStart)) {
    journeyStart.subtract(1, "day");
  }
  const journeyEnd = moment(journeyStart).add(1, "day");
  // Filtrar las columnas cuya hora final ya ha pasado.
  // Para cada columna se extrae la hora y se construye el intervalo a partir de journeyStart;
  // si la hora es menor a 22 se asume que corresponde al día siguiente en la misma jornada.
  const filteredHourColumns = hourColumns.filter((col) => {
    if (!col.accessor.startsWith("hour_")) return true;
    const startStr = col.accessor.replace("hour_", "");
    const [h, m] = startStr.split(":").map(Number);
    const turno = getTurnWithTime(startStr);
    let intervalStart = moment(journeyStart);
    if (h < 22) {
      intervalStart.add(1, "day");
    }
    intervalStart.set({ hour: h, minute: m, second: 0, millisecond: 0 });
    const intervalEnd = moment(intervalStart).add(1, "hour");
    return currentTime.isSameOrAfter(intervalEnd);
  });
  // Combinar las columnas fijas con las horarias filtradas.
  const allColumns = [...fixedColumns, ...filteredHourColumns];
  const hourAccessors = filteredHourColumns.map((col) => col.accessor);
  // Obtener la sección AR para extraer la lista predefinida de máquinas
  const arSection = seccionesOrdenadas.find((seccion) => seccion.seccion === "AR");
  // Obtener y agrupar registros desde el endpoint "/manual/manual/actualdia"
  // Se filtran los registros utilizando los límites de jornada (en lugar del filtrado por fecha simple).
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await clienteAxios.get("/manual/manual/actualdia");
        const registros = response.data.registros || [];
        // Filtrar por registros cuyo name comience con alguno de los prefijos válidos
        const registrosFiltradosPorNombre = registros.filter(reg =>
          validPrefixes.some(prefix => reg.name.startsWith(prefix))
        );
        // Filtrar registros usando los límites de jornada: se construye un objeto moment
        // combinando reg.fecha y los primeros 5 caracteres de reg.hour (formato "HH:mm")
        // y se mantienen únicamente los registros cuyo timestamp esté entre journeyStart y journeyEnd.
        const registrosFiltrados = registrosFiltradosPorNombre.filter(reg => {
          const recordMoment = moment(`${reg.fecha} ${reg.hour.slice(0, 5)}`, "YYYY-MM-DD HH:mm");
          return recordMoment.isSameOrAfter(journeyStart) && recordMoment.isBefore(journeyEnd);
        });
        // Agrupar registros por estación usando extractBaseName (esto producirá "52 FUSION", etc.)
        const agrupados = {};
        registrosFiltrados.forEach(reg => {
          const baseName = extractBaseName(reg.name);
          if (!agrupados[baseName]) {
            agrupados[baseName] = { nombre: baseName, totalAcumulado: 0 };
          }
          agrupados[baseName].totalAcumulado += Number(reg.hits);
          const key = `hour_${reg.hour.slice(0, 5)}`;
          agrupados[baseName][key] = (agrupados[baseName][key] || 0) + Number(reg.hits);
        });
        const dataAgrupada = Object.values(agrupados);
        // Completar la data con la lista predefinida de máquinas (incluso si no tienen registros)
        const maquinasArea = arSection ? arSection.nombres : [];
        const dataConMaquinasFijas = maquinasArea.map(maquina => {
          const registroExistente = dataAgrupada.find(reg => reg.nombre.toLowerCase() === maquina.toLowerCase());
          if (registroExistente) {
            return registroExistente;
          } else {
            const nuevoRegistro = { nombre: maquina, totalAcumulado: 0 };
            hourAccessors.forEach(key => {
              nuevoRegistro[key] = 0;
            });
            return nuevoRegistro;
          }
        });
        setTableData(dataConMaquinasFijas);
      } catch (error) {
        console.error("Error al consultar la API del manual:", error);
      }
    };
    fetchData();
  }, []);
  // Como en este caso no se utilizan metas, se inyecta un objeto vacío y se deja metaAcumulada en blanco.
  const finalFilteredData = useMemo(() => {
    return tableData.map(row => ({ ...row, metas: {}, metaAcumulada: "" }));
  }, [tableData]);
  // Calcular la fila de totales por columna
  const totalsRow = useMemo(() => {
    return allColumns.reduce((acc, col) => {
      if (col.accessor === "nombre") {
        acc[col.accessor] = "Totales";
      } else {
        acc[col.accessor] = finalFilteredData.reduce((sum, row) => sum + Number(row[col.accessor] || 0), 0);
      }
      return acc;
    }, {});
  }, [allColumns, finalFilteredData]);
  return (
    <div className="p-4">
      <Heading title="Resumen AR" />
      <AreaSelect />
      <TablaSurtidoMaquina
        columns={allColumns}
        finalFilteredData={finalFilteredData}
        totalsRow={totalsRow}
      />
    </div>
  );
};
export default Totales_AR_Maquina2;