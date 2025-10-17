import React, { useEffect, useState } from "react";
import clienteAxios from "../../../../config/clienteAxios";
import moment from "moment-timezone";

const CardBonosProduccion = () => {
  const [totalHits, setTotalHits] = useState(0);

  useEffect(() => {
    const cargarRegistros = async () => {
      try {
        const response = await clienteAxios("/manual/manual/jobcomplete_semanal");
        const registros = response.data.registros || [];

        // Calcular el rango de la semana actual
        const ahora = moment().tz("America/Mexico_City");
        let inicioSemana, finSemana;

        if (ahora.day() === 0 && ahora.hour() < 22) {
          inicioSemana = ahora.clone().subtract(1, "week").startOf("week").add(22, "hours");
        } else {
          inicioSemana = ahora.clone().startOf("week").add(22, "hours");
        }
        finSemana = inicioSemana.clone().add(7, "days").subtract(1, "seconds");

        // Filtrar registros: solo los de la semana actual y del domingo anterior desde las 22:00
        const registrosFiltrados = registros.filter((registro) => {
          const fechaHora = moment.tz(
            `${registro.fecha} ${registro.hour.length === 5 ? registro.hour + ":00" : registro.hour}`,
            "YYYY-MM-DD HH:mm:ss",
            "America/Mexico_City"
          );
          return fechaHora.isSameOrAfter(inicioSemana) && fechaHora.isSameOrBefore(finSemana);
        });

        // Sumar los hits de los registros filtrados
        const sumaHits = registrosFiltrados.reduce((acc, reg) => acc + (parseInt(reg.hits, 10) || 0), 0);
        setTotalHits(sumaHits);
      } catch (error) {
        console.error("Error al cargar los registros JOB COMPLETE:", error);
      }
    };

    cargarRegistros();
  }, []);

  const bono = totalHits * 0.02;

  return (
    <div className="bg-gray-800 p-10 rounded-lg shadow-lg max-w-xl w-full text-white">
      <h2 className="text-4xl font-bold mb-8 text-center text-green-400">Bonos Producción</h2>
      <div className="mb-8">
        <p className="text-3xl font-semibold">Trabajos enviados (semana):</p>
        <p className="text-5xl font-bold text-green-400">{totalHits.toLocaleString("es-MX")}</p>
      </div>
      <div className="mb-8">
        <p className="text-3xl font-semibold">Bono acumulado semanal:</p>
        <p className="text-5xl font-bold text-green-400">
          {bono.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
        </p>
      </div>
      <div className="text-center text-gray-400 text-lg">
        <span className="block">Semana: domingo 22:00 a domingo 21:59</span>
      </div>
    </div>
  );
};

export default CardBonosProduccion;