import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import Heading from "../others/Heading";
import clienteAxios from "../../../config/clienteAxios";
import TablaSurtidoMaquina from "../others/tables/TablaSurtidoMaquina";
import AreaSelect from "../others/html_personalizado/AreaSelect";
import { seccionesOrdenadas } from "../../../utilidades/SeccionesOrdenadas";
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
const Totales_Engraver_Maquina2 = () => {
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
  // Reordenar las columnas para que, al leer de derecha a izquierda,
  // aparezca primero el turno nocturno, luego el matutino y por último el vespertino.
  // En un entorno LTR la concatenación es: vespertino, matutino, nocturno.
  const hourColumns = [...vespertinoColumns, ...matutinoColumns, ...nocturnoColumns];
  // Definir los límites de la jornada:
  // La jornada inicia a las 22:00 de un día y finaliza a las 22:00 del día siguiente.
  const currentTime = moment();
  let journeyStart = moment().set({ hour: 22, minute: 0, second: 0, millisecond: 0 });
  if (currentTime.isBefore(journeyStart)) {
    journeyStart.subtract(1, "day");
  }
  const journeyEnd = moment(journeyStart).add(1, "day");
  // Filtrar los intervalos que ya se han cumplido dentro de la jornada actual.
  // Para cada columna se construye el momento a partir de journeyStart; si la hora es menor a 22 se suma un día.
  const filteredHourColumns = hourColumns.filter((col) => {
    if (!col.accessor.startsWith("hour_")) return true;
    const timeStr = col.accessor.replace("hour_", "");
    const [h, m] = timeStr.split(":").map(Number);
    let colMoment = moment(journeyStart);
    if (h < 22) {
      colMoment.add(1, "day");
    }
    colMoment.set({ hour: h, minute: m, second: 0, millisecond: 0 });
    const intervalEnd = moment(colMoment).add(1, "hour");
    return currentTime.isSameOrAfter(intervalEnd);
  });
  // Combinar las columnas fijas con las columnas horarias filtradas.
  const allColumns = [...fixedColumns, ...filteredHourColumns];
  const hourAccessors = filteredHourColumns.map((col) => col.accessor);
  // Obtener las metas de engravers desde el endpoint correspondiente.
  useEffect(() => {
    const fetchMetas = async () => {
      try {
        const response = await clienteAxios.get("/metas/metas-engravers");
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
        console.error("Error al obtener las metas de engravers:", error);
      }
    };
    fetchMetas();
  }, []);
  const engraverSection = seccionesOrdenadas.find(
    (seccion) => seccion.seccion === "Engraver"
  );
  // Obtener y agrupar registros desde el endpoint "/engraver/engraver/actualdia"
  // Se filtran los registros utilizando los límites de la jornada en lugar de comparar fechas simples.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await clienteAxios.get("/engraver/engraver/actualdia");
        const registros = response.data.registros || [];
        // Filtrar registros mediante la combinación de reg.fecha y reg.hour (usando los primeros 5 dígitos "HH:MM")
        // y conservar solo aquellos cuyo timestamp se encuentre entre journeyStart y journeyEnd.
        const registrosFiltrados = registros.filter((reg) => {
          const recordMoment = moment(
            `${reg.fecha} ${reg.hour.slice(0, 5)}`,
            "YYYY-MM-DD HH:mm"
          );
          return recordMoment.isSameOrAfter(journeyStart) && recordMoment.isBefore(journeyEnd);
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
        const maquinasArea = engraverSection ? engraverSection.nombres : [];
        const dataAgrupada = Object.values(agrupados);
        // Completar la data: para cada máquina en la lista (incluso sin registros) se asegura tener valores predeterminados.
        const dataConMaquinasFijas = maquinasArea.map((maquina) => {
          const registroExistente = dataAgrupada.find(
            (reg) => reg.nombre.toLowerCase() === maquina.toLowerCase()
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
        console.error("Error al consultar la API de engravers:", error);
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
        Object.keys(metas).length > 0
          ? computeMetaAcumulada(metas, hourAccessors)
          : "";
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
      <Heading title="Resumen engraver" />
      <AreaSelect />
      <TablaSurtidoMaquina
        columns={allColumns}
        finalFilteredData={finalFilteredData}
        totalsRow={totalsRow}
      />
    </div>
  );
};
export default Totales_Engraver_Maquina2;