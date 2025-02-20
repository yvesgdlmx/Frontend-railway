import React, { useEffect, useState } from "react";
import clienteAxios from "../../../config/clienteAxios";
import moment from "moment-timezone";

const Totales_Produccion_Tableros = () => {
  const [totalesPorTurno, setTotalesPorTurno] = useState({
    nocturno: 0,
    matutino: 0,
    vespertino: 0,
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const responseRegistros = await clienteAxios("/manual/manual/actualdia");
        const dataRegistros = responseRegistros.data.registros || [];
        const ahora = moment().tz("America/Mexico_City");

        // Determinar la “fecha de producción”.
        // Si la hora actual es menor a las 06:30, restamos un día.
        let fechaProduccion = ahora.clone();
        if (ahora.isBefore(moment().tz("America/Mexico_City").set({ hour: 6, minute: 30, second: 0, millisecond: 0 }))) {
          fechaProduccion.subtract(1, "days");
        }

        // Definir los rangos basados en la fecha de producción:
        // El turno nocturno corresponde al día anterior a las 22:00 y al día de producción hasta las 06:00.
        const nocturnoInicio = fechaProduccion.clone().subtract(1, "days").set({ hour: 22, minute: 0, second: 0, millisecond: 0 });
        const nocturnoFin = fechaProduccion.clone().set({ hour: 6, minute: 29, second: 0, millisecond: 0 });

        // Turno matutino: de las 06:30 a 14:29:59.999
        const matutinoInicio = fechaProduccion.clone().set({ hour: 6, minute: 30, second: 0, millisecond: 0 });
        const matutinoFin = fechaProduccion.clone().set({ hour: 14, minute: 29, second: 59, millisecond: 999 });

        // Turno vespertino: de las 14:30 a 21:30
        const vespertinoInicio = fechaProduccion.clone().set({ hour: 14, minute: 30, second: 0, millisecond: 0 });
        const vespertinoFin = fechaProduccion.clone().set({ hour: 21, minute: 30, second: 0, millisecond: 0 });

        // Se filtran sólo los registros del “celula” deseado
        const registrosFiltradosCelula = dataRegistros.filter(registro => {
          const celula = registro.name.split("-")[0].trim().toUpperCase().replace(/\s+/g, " ");
          return celula === "32 JOB COMPLETE";
        });

        // Debido a que el rango abarca parte del día anterior y parte del día de producción,
        // filtramos los registros entre nocturnoInicio y vespertinoFin
        const registrosFiltrados = registrosFiltradosCelula.filter(registro => {
          const fechaHoraRegistro = moment.tz(
            `${registro.fecha} ${registro.hour}`,
            "YYYY-MM-DD HH:mm:ss",
            "America/Mexico_City"
          );
          return fechaHoraRegistro.isBetween(nocturnoInicio, vespertinoFin, null, "[]");
        });

        calcularTotalesPorTurno(registrosFiltrados, {
          nocturnoInicio,
          nocturnoFin,
          matutinoInicio,
          matutinoFin,
          vespertinoInicio,
          vespertinoFin,
        });
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };

    cargarDatos();
  }, []);

  const calcularTotalesPorTurno = (registros, rangos) => {
    const totales = {
      nocturno: 0,
      matutino: 0,
      vespertino: 0,
    };

    registros.forEach(registro => {
      const fechaHoraRegistro = moment.tz(
        `${registro.fecha} ${registro.hour}`,
        "YYYY-MM-DD HH:mm:ss",
        "America/Mexico_City"
      );
      
      if (fechaHoraRegistro.isBetween(rangos.nocturnoInicio, rangos.nocturnoFin, null, "[)")) {
        totales.nocturno += parseInt(registro.hits || 0);
      } else if (fechaHoraRegistro.isBetween(rangos.matutinoInicio, rangos.matutinoFin, null, "[)")) {
        totales.matutino += parseInt(registro.hits || 0);
      } else if (fechaHoraRegistro.isBetween(rangos.vespertinoInicio, rangos.vespertinoFin, null, "[)")) {
        totales.vespertino += parseInt(registro.hits || 0);
      }
    });

    setTotalesPorTurno(totales);
  };

  // Suma total de ambos turnos
  const sumaTotalAcumulados = totalesPorTurno.nocturno + totalesPorTurno.matutino + totalesPorTurno.vespertino;

  return (
    <div className="w-full min-h-screen bg-black flex items-center justify-center">
      <div className="bg-gray-800 p-10 rounded-lg shadow-lg max-w-xl w-full text-white">
        <h2 className="text-4xl font-bold mb-8 text-center text-yellow-400">Totales de Producción</h2>
        <div className="mb-8">
          <p className="text-3xl font-semibold">Total General:</p>
          <p className="text-5xl font-bold text-yellow-400">{sumaTotalAcumulados}</p>
        </div>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-2xl">Nocturno:</span>
            <span className="text-3xl font-semibold">{totalesPorTurno.nocturno}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-2xl">Matutino:</span>
            <span className="text-3xl font-semibold">{totalesPorTurno.matutino}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-2xl">Vespertino:</span>
            <span className="text-3xl font-semibold">{totalesPorTurno.vespertino}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Totales_Produccion_Tableros;