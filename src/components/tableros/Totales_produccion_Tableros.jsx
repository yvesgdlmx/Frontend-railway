import React, { useEffect, useState } from "react";
import clienteAxios from "../../../config/clienteAxios";
import moment from "moment-timezone";
import { formatNumber } from "../../helpers/formatNumber";

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

        // Si la hora actual es >= 22, la jornada se considera del día siguiente
        let fechaProduccion = ahora.clone();
        if (ahora.hour() >= 22) {
          fechaProduccion.add(1, "day");
        }
        console.log("Fecha de producción considerada:", fechaProduccion.format("YYYY-MM-DD"));

        // Rango nocturno: del día anterior a las 22:00 hasta el día de producción a las 06:00.
        const nocturnoInicio = fechaProduccion.clone().subtract(1, "day").set({
          hour: 22,
          minute: 0,
          second: 0,
          millisecond: 0,
        });
        const nocturnoFin = fechaProduccion.clone().set({
          hour: 6,
          minute: 0,
          second: 0,
          millisecond: 0,
        });
        console.log("Nocturno Inicio:", nocturnoInicio.format("YYYY-MM-DD HH:mm:ss"));
        console.log("Nocturno Fin:", nocturnoFin.format("YYYY-MM-DD HH:mm:ss"));

        // Rango matutino: de las 06:30 a las 14:29:59.999.
        const matutinoInicio = fechaProduccion.clone().set({
          hour: 6,
          minute: 30,
          second: 0,
          millisecond: 0,
        });
        const matutinoFin = fechaProduccion.clone().set({
          hour: 14,
          minute: 29,
          second: 59,
          millisecond: 999,
        });

        // Rango vespertino: de las 14:30 a las 21:30.
        const vespertinoInicio = fechaProduccion.clone().set({
          hour: 14,
          minute: 30,
          second: 0,
          millisecond: 0,
        });
        const vespertinoFin = fechaProduccion.clone().set({
          hour: 21,
          minute: 30,
          second: 0,
          millisecond: 0,
        });

        // Filtramos registro de la célula deseada.
        const registrosFiltradosCelula = dataRegistros.filter((registro) => {
          const celula = registro.name
            .split("-")[0]
            .trim()
            .toUpperCase()
            .replace(/\s+/g, " ");
          return celula === "32 JOB COMPLETE";
        });

        console.log("Registros para la célula:", registrosFiltradosCelula.length);

        // Filtramos los registros que se encuentren en el rango extendido (nocturno + matutino + vespertino).
        const registrosFiltrados = registrosFiltradosCelula.filter((registro) => {
          // IMPORTANTE: Verifica el formato de registro.fecha y registro.hour.  
          // Si registro.hour viene como "23:00" y no "23:00:00", ajusta el formato.
          const formatoEsperado = "YYYY-MM-DD HH:mm:ss";
          const horaRegistro = registro.hour.length === 5 ? `${registro.hour}:00` : registro.hour;
          const fechaHoraRegistro = moment.tz(
            `${registro.fecha} ${horaRegistro}`,
            formatoEsperado,
            "America/Mexico_City"
          );

          // Log para ver cada registro
          console.log(
            "Registro:",
            `${registro.fecha} ${horaRegistro}`,
            "->",
            fechaHoraRegistro.format("YYYY-MM-DD HH:mm:ss")
          );

          // Filtramos entre nocturnoInicio y vespertinoFin (intervalo amplio)
          return fechaHoraRegistro.isSameOrAfter(nocturnoInicio) && fechaHoraRegistro.isSameOrBefore(vespertinoFin);
        });

        console.log("Registros filtrados totales:", registrosFiltrados.length);

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
    const totales = { nocturno: 0, matutino: 0, vespertino: 0 };

    registros.forEach((registro) => {
      const formatoEsperado = "YYYY-MM-DD HH:mm:ss";
      const horaRegistro = registro.hour.length === 5 ? `${registro.hour}:00` : registro.hour;
      const fechaHoraRegistro = moment.tz(
        `${registro.fecha} ${horaRegistro}`,
        formatoEsperado,
        "America/Mexico_City"
      );
      console.log(
        "Evaluando registro:",
        fechaHoraRegistro.format("YYYY-MM-DD HH:mm:ss"),
        "Hits:",
        registro.hits
      );

      // Usamos isSameOrAfter / isBefore para controlar los límites
      if (
        fechaHoraRegistro.isSameOrAfter(rangos.nocturnoInicio) &&
        fechaHoraRegistro.isBefore(rangos.nocturnoFin)
      ) {
        totales.nocturno += parseInt(registro.hits || 0, 10);
        console.log("Se suma a nocturno");
      } else if (
        fechaHoraRegistro.isSameOrAfter(rangos.matutinoInicio) &&
        fechaHoraRegistro.isBefore(rangos.matutinoFin)
      ) {
        totales.matutino += parseInt(registro.hits || 0, 10);
        console.log("Se suma a matutino");
      } else if (
        fechaHoraRegistro.isSameOrAfter(rangos.vespertinoInicio) &&
        fechaHoraRegistro.isBefore(rangos.vespertinoFin)
      ) {
        totales.vespertino += parseInt(registro.hits || 0, 10);
        console.log("Se suma a vespertino");
      } else {
        console.log("Registro fuera de rangos");
      }
    });
    setTotalesPorTurno(totales);
  };

  const sumaTotalAcumulados =
    totalesPorTurno.nocturno +
    totalesPorTurno.matutino +
    totalesPorTurno.vespertino;

  return (
    <div className="w-full min-h-screen bg-black flex items-center justify-center">
      <div className="bg-gray-800 p-10 rounded-lg shadow-lg max-w-xl w-full text-white">
        <h2 className="text-4xl font-bold mb-8 text-center text-yellow-400">Totales de Producción</h2>
        <div className="mb-8">
          <p className="text-3xl font-semibold">Total General:</p>
          <p className="text-5xl font-bold text-yellow-400">{formatNumber(sumaTotalAcumulados)}</p>
        </div>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-2xl">Nocturno:</span>
            <span className="text-3xl font-semibold">{formatNumber(totalesPorTurno.nocturno)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-2xl">Matutino:</span>
            <span className="text-3xl font-semibold">{formatNumber(totalesPorTurno.matutino)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-2xl">Vespertino:</span>
            <span className="text-3xl font-semibold">{formatNumber(totalesPorTurno.vespertino)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Totales_Produccion_Tableros;