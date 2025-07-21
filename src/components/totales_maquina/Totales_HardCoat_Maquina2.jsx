import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import Heading from "../others/Heading";
import clienteAxios from "../../../config/clienteAxios";
import TablaSurtidoMaquina from "../others/tables/TablaSurtidoMaquina";
import AreaSelect from "../others/html_personalizado/AreaSelect";
import { seccionesOrdenadas } from "../../../utilidades/SeccionesOrdenadas";
// Extrae el nombre base (se asume que está separado por guion)
const extractBaseName = (name) => name.split("-")[0].trim();
// Suma una hora a un string en formato "HH:MM"
const addOneHour = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const nextHour = (hours + 1) % 24;
  return String(nextHour).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");
};
// Determina el turno según el tiempo
// Nocturno: >=22 o <6, Matutino: 06:30 a 14:30, Vespertino: el resto.
const getTurnWithTime = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  if (h >= 22 || h < 6) {
    return "meta_nocturno";
  }
  const totalMin = h * 60 + m;
  if (totalMin >= 390 && totalMin < 870) return "meta_matutino";
  return "meta_vespertino";
};
// Genera columnas para el turno matutino (06:30 a 14:30)
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
// Genera columnas para el turno vespertino (14:30 a 22:30)
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
// Genera columnas para el turno nocturno (22:00 a 06:00)
// Se generan para las horas: 22, 23, 0, 1, 2, 3, 4, 5.
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
const Totales_HardCoat_Maquina2 = () => {
  const [tableData, setTableData] = useState([]);
  // Registros de interés: aquellos cuyo name comienza con alguno de estos prefijos.
  const validPrefixes = [
    "46 MR3.4",
    "48 MR3.1",
    "49 MR3.2",
    "50 MR3.3",
    "91 VELOCITY 1",
    "92 VELOCITY 2"
  ];
  // Columnas fijas y columnas horarias.
  const fixedColumns = [
    { header: "Nombre", accessor: "nombre" },
    { header: "Total acumulado", accessor: "totalAcumulado" }
  ];
  const matutinoColumns = generateMatutinoColumns().reverse();
  const vespertinoColumns = generateVespertinoColumns().reverse();
  const nocturnoColumns = generateNocturnoColumns().reverse();
  // Orden para entorno LTR: vespertino, matutino y luego nocturno.
  const hourColumns = [...vespertinoColumns, ...matutinoColumns, ...nocturnoColumns];
  // Se definen los límites de la jornada:
  // La jornada inicia a las 22:00 de un día y termina a las 22:00 del día siguiente.
  const currentTime = moment();
  let journeyStart = moment().set({ hour: 22, minute: 0, second: 0, millisecond: 0 });
  if (currentTime.isBefore(journeyStart)) {
    journeyStart.subtract(1, "day");
  }
  const journeyEnd = moment(journeyStart).add(1, "day");
  // Filtra las columnas horarias: incluimos solo aquellas cuyo intervalo completo de 1 hora ya concluyó,
  // utilizando los límites de jornada.
  const filteredHourColumns = hourColumns.filter((col) => {
    if (!col.accessor.startsWith("hour_")) return true;
    const startStr = col.accessor.replace("hour_", "");
    const [h, m] = startStr.split(":").map(Number);
    let intervalStart = moment(journeyStart);
    // Si la hora es menor a 22, significa que corresponde al día siguiente dentro de la misma jornada.
    if (h < 22) {
      intervalStart.add(1, "day");
    }
    intervalStart.set({ hour: h, minute: m, second: 0, millisecond: 0 });
    const intervalEnd = moment(intervalStart).add(1, "hour");
    return currentTime.isSameOrAfter(intervalEnd);
  });
  const allColumns = [...fixedColumns, ...filteredHourColumns];
  const hourAccessors = filteredHourColumns.map((col) => col.accessor);
  const hardcoatSection = seccionesOrdenadas.find(
    (seccion) => seccion.seccion === "Hardcoat"
  );
  // Se obtiene y agrupan los registros desde el endpoint "/manual/manual/actualdia",
  // filtrando los registros cuyo timestamp (combinación de reg.fecha y reg.hour) esté entre journeyStart y journeyEnd.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await clienteAxios.get("/manual/manual/actualdia");
        const registros = response.data.registros || [];
        // Filtrar registros por nombre usando los prefijos válidos.
        const registrosFiltradosPorNombre = registros.filter(reg =>
          validPrefixes.some(prefix => reg.name && reg.name.startsWith(prefix))
        );
        // Filtrar registros usando los límites de jornada.
        const registrosFiltrados = registrosFiltradosPorNombre.filter(reg => {
          const recordMoment = moment(
            `${reg.fecha} ${reg.hour.slice(0, 5)}`,
            "YYYY-MM-DD HH:mm"
          );
          return recordMoment.isSameOrAfter(journeyStart) && recordMoment.isBefore(journeyEnd);
        });
        // Agrupar los registros por máquina usando extractBaseName.
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
        // Lista fija de máquinas HardCoat.
        const maquinasArea = hardcoatSection ? hardcoatSection.nombres : [];
        // Completa la data para incluir todas las máquinas de la lista predefinida.
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
        console.error("Error al obtener los registros de HardCoat:", error);
      }
    };
    fetchData();
  }, []);
  // Al no manejar metas, inyecta un objeto vacío en "metas" y deja "metaAcumulada" en blanco.
  const finalFilteredData = useMemo(() => {
    return tableData.map(row => ({ ...row, metas: {}, metaAcumulada: "" }));
  }, [tableData]);
  // Calcula la fila de totales por columna.
  const totalsRow = useMemo(() => {
    return allColumns.reduce((acc, col) => {
      if (col.accessor === "nombre") {
        acc[col.accessor] = "Totales";
      } else {
        acc[col.accessor] = finalFilteredData.reduce((sum, row) =>
          sum + Number(row[col.accessor] || 0), 0);
      }
      return acc;
    }, {});
  }, [allColumns, finalFilteredData]);
  return (
    <div className="p-4">
      <Heading title="Resumen HardCoat" />
      <AreaSelect />
      <TablaSurtidoMaquina
        columns={allColumns}
        finalFilteredData={finalFilteredData}
        totalsRow={totalsRow}
      />
    </div>
  );
};
export default Totales_HardCoat_Maquina2;