import React, { useEffect, useState } from "react";
import clienteAxios from "../../../config/clienteAxios";
import moment from "moment-timezone";

// Configuramos Moment.js en la zona horaria de México
moment.tz.setDefault("America/Mexico_City");

const Totales_Produccion_Tableros = () => {
  const [totalesPorTurno, setTotalesPorTurno] = useState({
    nocturno: 0,
    matutino: 0,
    vespertino: 0,
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const response = await clienteAxios.get("/manual/manual/actualdia");
        const registros = response.data.registros || [];

        const ahora = moment().tz("America/Mexico_City");

        // Definimos límites de turno basados en la fecha en curso
        // Queremos que:
        // • El turno nocturno sea del día anterior a las 22:00 hasta el día actual a las 06:00.
        // • El matutino y vespertino correspondan al día actual.
        let inicioNocturno, finNocturno, inicioMatutino, finMatutino, inicioVespertino, finVespertino;
        // Si estamos antes de las 22:00 (por ejemplo, hoy 02:48), se toma:
        // inicioNocturno: ayer a las 22:00 y finNocturno: hoy a las 06:00.
        if (ahora.hour() < 22) {
          inicioNocturno = ahora.clone().subtract(1, "day").startOf("day").add(22, "hours");
          finNocturno = ahora.clone().startOf("day").add(6, "hours");
          // Turnos del día actual:
          inicioMatutino = ahora.clone().startOf("day").add(6, "hours").add(30, "minutes");
          finMatutino = ahora.clone().startOf("day").add(14, "hours").add(29, "minutes");
          inicioVespertino = ahora.clone().startOf("day").add(14, "hours").add(30, "minutes");
          finVespertino = ahora.clone().startOf("day").add(21, "hours").add(30, "minutes");
        } else {
          // Si estamos a partir de las 22:00
          // El turno nocturno empieza hoy 22:00 y termina mañana 06:00.
          inicioNocturno = ahora.clone().startOf("day").add(22, "hours");
          finNocturno = ahora.clone().add(1, "day").startOf("day").add(6, "hours");
          // Turnos del día siguiente:
          inicioMatutino = ahora.clone().add(1, "day").startOf("day").add(6, "hours").add(30, "minutes");
          finMatutino = ahora.clone().add(1, "day").startOf("day").add(14, "hours").add(29, "minutes");
          inicioVespertino = ahora.clone().add(1, "day").startOf("day").add(14, "hours").add(30, "minutes");
          finVespertino = ahora.clone().add(1, "day").startOf("day").add(21, "hours").add(30, "minutes");
        }

        // (Opcional) Muestra en consola los límites calculados para depuración
        console.log("Inicio nocturno:", inicioNocturno.format("YYYY-MM-DD HH:mm:ss"));
        console.log("Fin nocturno:", finNocturno.format("YYYY-MM-DD HH:mm:ss"));
        console.log("Inicio matutino:", inicioMatutino.format("YYYY-MM-DD HH:mm:ss"));
        console.log("Fin matutino:", finMatutino.format("YYYY-MM-DD HH:mm:ss"));
        console.log("Inicio vespertino:", inicioVespertino.format("YYYY-MM-DD HH:mm:ss"));
        console.log("Fin vespertino:", finVespertino.format("YYYY-MM-DD HH:mm:ss"));

        // Inicializamos acumuladores
        let totalNocturno = 0;
        let totalMatutino = 0;
        let totalVespertino = 0;

        registros.forEach((registro) => {
          // Convertimos la fecha y hora del registro al formato Moment, asumiendo formato "YYYY-MM-DD HH:mm:ss"
          const fechaHoraRegistro = moment.tz(
            `${registro.fecha} ${registro.hour}`,
            "YYYY-MM-DD HH:mm:ss",
            "America/Mexico_City"
          );

          // Se evalúa a qué turno pertenece el registro
          if (fechaHoraRegistro.isBetween(inicioNocturno, finNocturno, null, "[)")) {
            totalNocturno += parseInt(registro.hits || 0, 10);
          } else if (fechaHoraRegistro.isBetween(inicioMatutino, finMatutino, null, "[)")) {
            totalMatutino += parseInt(registro.hits || 0, 10);
          } else if (fechaHoraRegistro.isBetween(inicioVespertino, finVespertino, null, "[)")) {
            totalVespertino += parseInt(registro.hits || 0, 10);
          }
        });

        setTotalesPorTurno({
          nocturno: totalNocturno,
          matutino: totalMatutino,
          vespertino: totalVespertino,
        });
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };

    cargarDatos();
  }, []);

  const sumaTotalAcumulados =
    totalesPorTurno.nocturno + totalesPorTurno.matutino + totalesPorTurno.vespertino;

  return (
    <div className="w-full min-h-screen bg-black flex items-center justify-center">
      <div className="bg-gray-800 p-10 rounded-lg shadow-lg max-w-xl w-full text-white">
        <h2 className="text-4xl font-bold mb-8 text-center text-yellow-400">
          Totales de Producción
        </h2>
        <div className="mb-8">
          <p className="text-3xl font-semibold">Total General:</p>
          <p className="text-5xl font-bold text-yellow-400">{sumaTotalAcumulados}</p>
        </div>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-2xl">Nocturno (22:00 - 06:00):</span>
            <span className="text-3xl font-semibold">{totalesPorTurno.nocturno}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-2xl">Matutino (06:30 - 14:29):</span>
            <span className="text-3xl font-semibold">{totalesPorTurno.matutino}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-2xl">Vespertino (14:30 - 21:30):</span>
            <span className="text-3xl font-semibold">{totalesPorTurno.vespertino}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Totales_Produccion_Tableros;