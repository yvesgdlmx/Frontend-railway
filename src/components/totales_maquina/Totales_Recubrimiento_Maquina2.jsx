import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import Heading from "../others/Heading";
import clienteAxios from "../../../config/clienteAxios";
import TablaSurtidoMaquina from "../others/tables/TablaSurtidoMaquina";
import AreaSelect from "../others/html_personalizado/AreaSelect";
import { seccionesOrdenadas } from "../../../utilidades/SeccionesOrdenadas";
// Función para extraer el nombre base (separando por guion)
const extractBaseName = (name) => name.split("-")[0].trim();
// Función que suma una hora a un string con formato "HH:MM"
const addOneHour = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const nextHour = (hours + 1) % 24;
  return String(nextHour).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");
};
// Función para determinar el turno según el tiempo
const getTurnWithTime = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  if (h >= 22 || h < 6) return "meta_nocturno";
  const totalMin = h * 60 + m;
  if (totalMin >= 390 && totalMin < 870) return "meta_matutino";
  return "meta_vespertino";
};
// Columnas para el turno matutino (06:30 a 14:30)
const generateMatutinoColumns = () => {
  const cols = [];
  for (let hour = 6; hour < 14; hour++) {
    const start = String(hour).padStart(2, "0") + ":30";
    const header = `${start} - ${String((hour + 1) % 24).padStart(2, "0")}:30`;
    cols.push({ header, accessor: `hour_${start}` });
  }
  return cols;
};
// Columnas para el turno vespertino (14:30 a 22:30)
const generateVespertinoColumns = () => {
  const cols = [];
  for (let hour = 14; hour < 22; hour++) {
    const start = String(hour).padStart(2, "0") + ":30";
    const header = `${start} - ${String((hour + 1) % 24).padStart(2, "0")}:30`;
    cols.push({ header, accessor: `hour_${start}` });
  }
  return cols;
};
// Columnas para el turno nocturno (22:00 a 06:00)
const generateNocturnoColumns = () => {
  const cols = [];
  const horas = [22, 23, 0, 1, 2, 3, 4, 5];
  horas.forEach(h => {
    const start = String(h).padStart(2, "0") + ":00";
    const header = `${start} - ${addOneHour(start)}`;
    cols.push({ header, accessor: `hour_${start}` });
  });
  return cols;
};
const Totales_Recubrimiento_Maquina2 = () => {
  const [tableData, setTableData] = useState([]);
  // Los registros de interés deben comenzar con "60 AR ENTRADA" o "61 AR SALIDA"
  const validPrefixes = ["60 AR ENTRADA", "61 AR SALIDA"];
  // Columnas fijas
  const fixedColumns = [
    { header: "Nombre", accessor: "nombre" },
    { header: "Total acumulado", accessor: "totalAcumulado" }
  ];
  // Generar las columnas horarias
  const matutinoColumns = generateMatutinoColumns().reverse();
  const vespertinoColumns = generateVespertinoColumns().reverse();
  const nocturnoColumns = generateNocturnoColumns().reverse();
  // Orden: vespertino, matutino, nocturno (para entorno LTR)
  const hourColumns = [...vespertinoColumns, ...matutinoColumns, ...nocturnoColumns];
  // Definir los límites de jornada:
  // La jornada inicia a las 22:00 de un día y termina a las 22:00 del día siguiente.
  const currentTime = moment();
  let journeyStart = moment().set({ hour: 22, minute: 0, second: 0, millisecond: 0 });
  if (currentTime.isBefore(journeyStart)) {
    journeyStart.subtract(1, "day");
  }
  const journeyEnd = moment(journeyStart).add(1, "day");
  // Filtrar las columnas horarias que ya han concluido dentro de la jornada actual.
  const filteredHourColumns = hourColumns.filter((col) => {
    if (!col.accessor.startsWith("hour_")) return true;
    const startStr = col.accessor.replace("hour_", "");
    const [h, m] = startStr.split(":").map(Number);
    let intervalStart = moment(journeyStart);
    // Si la hora es menor a 22, corresponde al día siguiente dentro de la misma jornada.
    if (h < 22) {
      intervalStart.add(1, "day");
    }
    intervalStart.set({ hour: h, minute: m, second: 0, millisecond: 0 });
    const intervalEnd = moment(intervalStart).add(1, "hour");
    return currentTime.isSameOrAfter(intervalEnd);
  });
  const allColumns = [...fixedColumns, ...filteredHourColumns];
  const hourAccessors = filteredHourColumns.map((col) => col.accessor);
  // Obtener la sección Recubrimiento para la lista de máquinas
  const recubrimientoSection = seccionesOrdenadas.find(
    (seccion) => seccion.seccion === "Recubrimiento"
  );
  // Fetch de los registros con filtrado usando los límites de jornada
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await clienteAxios.get("/manual/manual/actualdia");
        const registros = response.data.registros || [];
        // Filtrar registros cuyo name comience con alguno de los prefijos válidos
        const registrosFiltradosPorNombre = registros.filter(reg =>
          validPrefixes.some(prefix => reg.name && reg.name.startsWith(prefix))
        );
        // Filtrar registros utilizando los límites de jornada:
        // Se crea un objeto moment combinando reg.fecha y los primeros 5 caracteres de reg.hour ("HH:mm")
        // y se conserva el registro si su timestamp está entre journeyStart y journeyEnd.
        const registrosFiltrados = registrosFiltradosPorNombre.filter(reg => {
          const recordMoment = moment(`${reg.fecha} ${reg.hour.slice(0, 5)}`, "YYYY-MM-DD HH:mm");
          return recordMoment.isSameOrAfter(journeyStart) && recordMoment.isBefore(journeyEnd);
        });
        // Agrupar registros usando extractBaseName (por ejemplo, "60 AR ENTRADA")
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
        // Completar la data con las máquinas fijas (aunque no tengan registros)
        const maquinasArea = recubrimientoSection ? recubrimientoSection.nombres : [];
        const dataConMaquinasFijas = maquinasArea.map(maquina => {
          const registroExistente = dataAgrupada.find(
            reg => reg.nombre.toLowerCase() === maquina.toLowerCase()
          );
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
        console.error("Error en fetch de Recubrimiento:", error);
      }
    };
    fetchData();
  }, []);
  // Inyectar un objeto vacío en "metas" y dejar "metaAcumulada" en blanco
  const finalFilteredData = useMemo(
    () => tableData.map(row => ({ ...row, metas: {}, metaAcumulada: "" })),
    [tableData]
  );
  // Calcular la fila de totales para cada columna
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
      <Heading title="Resumen Recubrimiento" />
      <AreaSelect />
      <TablaSurtidoMaquina 
        columns={allColumns} 
        finalFilteredData={finalFilteredData} 
        totalsRow={totalsRow} 
      />
    </div>
  );
};
export default Totales_Recubrimiento_Maquina2;