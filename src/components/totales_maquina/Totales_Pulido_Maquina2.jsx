import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import Heading from "../others/Heading";
import clienteAxios from "../../../config/clienteAxios";
import TablaSurtidoMaquina from "../others/tables/TablaSurtidoMaquina";
import AreaSelect from "../others/html_personalizado/AreaSelect";
import { seccionesOrdenadas } from "../../../utilidades/SeccionesOrdenadas";
// Función para extraer el nombre base (separa por guion) y agrupar estaciones
const extractBaseName = (name) => name.split("-")[0].trim();
// Función que resta una hora a un string con formato "HH:MM"
const subtractOneHour = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const prevHour = (hours + 23) % 24;
  return String(prevHour).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");
};
// Función getTurnWithTime para diferenciar los turnos.
// La hora del registro representa el cierre del bucket.
const getTurnWithTime = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  const totalMin = h * 60 + m;
  if (h >= 23 || totalMin <= 360) {
    return "meta_nocturno";
  }
  if (totalMin > 390 && totalMin <= 870) return "meta_matutino";
  return "meta_vespertino";
};
const createClosedBucketColumn = (endStr) => ({
  header: `${subtractOneHour(endStr)} - ${endStr}`,
  accessor: `hour_${endStr}`,
});
// Generador de columnas para el turno matutino (cierres de 07:30 a 14:30)
const generateMatutinoColumns = () => {
  const cols = [];
  for (let hour = 7; hour <= 14; hour++) {
    const endStr = String(hour).padStart(2, "0") + ":30";
    cols.push(createClosedBucketColumn(endStr));
  }
  return cols;
};
// Generador de columnas para el turno vespertino (cierres de 15:30 a 21:30)
const generateVespertinoColumns = () => {
  const cols = [];
  for (let hour = 15; hour <= 21; hour++) {
    const endStr = String(hour).padStart(2, "0") + ":30";
    cols.push(createClosedBucketColumn(endStr));
  }
  return cols;
};
// Generador de columnas para el turno nocturno (cierres de 23:00 a 06:00)
const generateNocturnoColumns = () => {
  const cols = [];
  const hours = [23, 0, 1, 2, 3, 4, 5, 6];
  for (let h of hours) {
    const endStr = String(h).padStart(2, "0") + ":00";
    cols.push(createClosedBucketColumn(endStr));
  }
  return cols;
};
const Totales_Pulido_Maquina2 = () => {
  const [tableData, setTableData] = useState([]);
  const [metasMapping, setMetasMapping] = useState({});
  // Columnas fijas (Nombre y Total acumulado)
  const fixedColumns = [
    { header: "Nombre", accessor: "nombre" },
    { header: "Total acumulado", accessor: "totalAcumulado" }
  ];
  // Generar e invertir las columnas de cada turno para mostrarlas de derecha a izquierda.
  const matutinoColumns = generateMatutinoColumns().reverse();
  const vespertinoColumns = generateVespertinoColumns().reverse();
  const nocturnoColumns = generateNocturnoColumns().reverse();
  // Reordenamos las columnas para que, al leer de derecha a izquierda,
  // la concatenación sea: vespertino, matutino, nocturno.
  const hourColumns = [...vespertinoColumns, ...matutinoColumns, ...nocturnoColumns];
  // Determinamos la hora actual y el inicio de la jornada (a las 22:00).
  const currentTime = moment();
  let journeyStart = moment().set({ hour: 22, minute: 0, second: 0, millisecond: 0 });
  if (currentTime.isBefore(journeyStart)) {
    // Si es antes de las 22:00, la jornada actual empezó ayer a las 22:00.
    journeyStart.subtract(1, "day");
  }
  const journeyEnd = moment(journeyStart).add(1, "day").subtract(30, "minutes");
  // Filtrar los intervalos (columnas) que ya se han cumplido dentro de la jornada actual.
  // Cada columna se muestra cuando se alcanza su hora de cierre.
  const filteredHourColumns = hourColumns.filter((col) => {
    if (!col.accessor.startsWith("hour_")) return true;
    const timeStr = col.accessor.replace("hour_", "");
    const [h, m] = timeStr.split(":").map(Number);
    
    // Se arma el momento de la columna usando el "journeyStart".
    // Si la hora es menor a 22, corresponde al día siguiente en la misma jornada.
    let colMoment = moment(journeyStart);
    if (h < 22) {
      colMoment.add(1, "day");
    }
    colMoment.set({ hour: h, minute: m, second: 0, millisecond: 0 });
    
    return currentTime.isSameOrAfter(colMoment);
  });
  // Combinar las columnas fijas con las columnas horarias filtradas.
  const allColumns = [...fixedColumns, ...filteredHourColumns];
  const hourAccessors = filteredHourColumns.map((col) => col.accessor);
  // Obtener las metas de pulidos desde el endpoint correspondiente.
  useEffect(() => {
    const fetchMetas = async () => {
      try {
        const response = await clienteAxios.get("/metas/metas-pulidos");
        const registrosMetas = response.data.registros || [];
        const mapping = {};
        registrosMetas.forEach((reg) => {
          mapping[reg.name] = {
            meta_nocturno: reg.meta_nocturno,
            meta_matutino: reg.meta_matutino,
            meta_vespertino: reg.meta_vespertino
          };
        });
        setMetasMapping(mapping);
      } catch (error) {
        console.error("Error al obtener las metas de pulidos:", error);
      }
    };
    fetchMetas();
  }, []);
  const pulidoSection = seccionesOrdenadas.find((seccion) => seccion.seccion === "Pulido");
  // Obtener y agrupar registros desde el endpoint "/pulido/pulido/actualdia"
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await clienteAxios.get("/pulido/pulido/actualdia");
        const registros = response.data.registros || [];
        // Filtrar los registros según la jornada actual definida entre journeyStart y journeyEnd.
        // Para cada registro, combinamos reg.fecha y reg.hour (formateando solo HH:mm) para crear el momento.
        const registrosFiltrados = registros.filter((reg) => {
          const recordMoment = moment(
            `${reg.fecha} ${reg.hour.slice(0, 5)}`,
            "YYYY-MM-DD HH:mm"
          );
          return recordMoment.isAfter(journeyStart) && recordMoment.isSameOrBefore(journeyEnd);
        });
        // Agrupar registros por estación (usando el nombre base)
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
        // Definir la lista predefinida de máquinas para pulidos
        const maquinasArea = pulidoSection ? pulidoSection.nombres : [];
        const dataAgrupada = Object.values(agrupados);
        // Completar la data con las máquinas fijas
        const dataConMaquinasFijas = maquinasArea.map((maquina) => {
          // Buscamos si ya existe un registro para la máquina (comparación sin distinguir mayúsculas/minúsculas)
          const registroExistente = dataAgrupada.find(
            (reg) => reg.nombre.toLowerCase() === maquina.toLowerCase()
          );
          if (registroExistente) {
            return registroExistente;
          } else {
            // Si no existe, se crea un registro con valores por defecto
            const nuevoRegistro = { nombre: maquina, totalAcumulado: 0 };
            hourAccessors.forEach((key) => {
              nuevoRegistro[key] = 0;
            });
            return nuevoRegistro;
          }
        });
        setTableData(dataConMaquinasFijas);
      } catch (error) {
        console.error("Error al consultar la API de pulidos:", error);
      }
    };
    fetchData();
  }, []);
  // Función para calcular la meta acumulada según cada columna (según turno)
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
      <Heading title="Resumen pulido" />
      <AreaSelect />
      <TablaSurtidoMaquina
        columns={allColumns}
        finalFilteredData={finalFilteredData}
        totalsRow={totalsRow}
      />
    </div>
  );
};
export default Totales_Pulido_Maquina2;
