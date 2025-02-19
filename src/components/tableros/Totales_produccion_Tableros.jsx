import React, { useEffect, useState } from "react";
import clienteAxios from "../../../config/clienteAxios";
import moment from "moment-timezone";

// Configuramos Moment.js con la zona horaria de México
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

        // Obtenemos el momento actual
        const ahora = moment().tz("America/Mexico_City");

        // Definimos límites de cada turno según la hora actual:
        // Si la hora actual es mayor o igual a las 22:00, se considera que la nueva jornada inicia
        // hoy a las 22:00 y termina mañana a las 06:00.
        let inicioNocturno, finNocturno, inicioMatutino, finMatutino, inicioVespertino, finVespertino;
        if (ahora.hour() >= 22) {
          // Nueva jornada: nocturno de hoy 22:00 a mañana 06:00  
          inicioNocturno = ahora.clone().startOf("day").add(22, "hours");
          finNocturno = ahora.clone().add(1, "day").startOf("day").add(6, "hours");
          // Los turnos siguientes corresponden al día siguiente
          inicioMatutino = ahora.clone().add(1, "day").startOf("day").add(6, "hours").add(30, "minutes");
          finMatutino = ahora.clone().add(1, "day").startOf("day").add(14, "hours").add(29, "minutes");
          inicioVespertino = ahora.clone().add(1, "day").startOf("day").add(14, "hours").add(30, "minutes");
          finVespertino = ahora.clone().add(1, "day").startOf("day").add(21, "hours").add(30, "minutes");
        } else {
          // Jornada actual: nocturno de ayer 22:00 a hoy 06:00  
          inicioNocturno = ahora.clone().subtract(1, "day").startOf("day").add(22, "hours");
          finNocturno = ahora.clone().startOf("day").add(6, "hours");
          // Turnos del día actual
          inicioMatutino = ahora.clone().startOf("day").add(6, "hours").add(30, "minutes");
          finMatutino = ahora.clone().startOf("day").add(14, "hours").add(29, "minutes");
          inicioVespertino = ahora.clone().startOf("day").add(14, "hours").add(30, "minutes");
          finVespertino = ahora.clone().startOf("day").add(21, "hours").add(30, "minutes");
        }

        // Inicializamos contadores para cada turno
        let totalNocturno = 0;
        let totalMatutino = 0;
        let totalVespertino = 0;

        // Recorremos cada registro y sumamos los hits según su franja horaria.
        registros.forEach((registro) => {
          const fechaHoraRegistro = moment.tz(
            `${registro.fecha} ${registro.hour}`,
            "YYYY-MM-DD HH:mm:ss",
            "America/Mexico_City"
          );
          // Se evalúa a cuál turno pertenece el registro:
          if (fechaHoraRegistro.isBetween(inicioNocturno, finNocturno, null, "[)")) {
            totalNocturno += parseInt(registro.hits || 0, 10);
          } else if (fechaHoraRegistro.isBetween(inicioMatutino, finMatutino, null, "[)")) {
            totalMatutino += parseInt(registro.hits || 0, 10);
          } else if (fechaHoraRegistro.isBetween(inicioVespertino, finVespertino, null, "[)")) {
            totalVespertino += parseInt(registro.hits || 0, 10);
          }
        });

        // Actualizamos el estado con los totales de cada turno
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
    totalesPorTurno.nocturno +
    totalesPorTurno.matutino +
    totalesPorTurno.vespertino;

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