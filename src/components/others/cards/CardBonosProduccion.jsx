import React, { useEffect, useState } from "react";
import clienteAxios from "../../../../config/clienteAxios";
import moment from "moment-timezone";
import "moment/locale/es"; // Importar el locale español

const CardBonosProduccion = () => {
  const [totalHits, setTotalHits] = useState(0);
  const [rangoSemana, setRangoSemana] = useState("");

  useEffect(() => {
    const cargarRegistros = async () => {
      try {
        const response = await clienteAxios("/manual/manual/jobcomplete_semanal");
        const registros = response.data.registros || [];

        // Configurar moment en español de forma global
        moment.locale('es');

        // Calcular el rango: sábado 22:00 -> siguiente sábado 21:59:59
        const ahora = moment().tz("America/Mexico_City");
        const sabadoEstaSemana = ahora.clone().startOf('week').add(6, 'days'); // sábado 00:00
        const sabadoEstaSemana22 = sabadoEstaSemana.clone().add(22, 'hours'); // sábado 22:00

        let inicioSemana;
        if (ahora.isBefore(sabadoEstaSemana22)) {
          inicioSemana = sabadoEstaSemana22.clone().subtract(1, 'week'); // sábado 22:00 anterior
        } else {
          inicioSemana = sabadoEstaSemana22; // sábado 22:00 actual
        }
        const finSemana = inicioSemana.clone().add(7, 'days').subtract(1, 'seconds'); // siguiente sábado 21:59:59

        // Mapear días y meses manualmente en español (opcional, moment también los da)
        const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                       'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

        const inicioFormateado = `${diasSemana[inicioSemana.day()]} ${inicioSemana.date()} de ${meses[inicioSemana.month()]}`;
        const finFormateado = `${diasSemana[finSemana.day()]} ${finSemana.date()} de ${meses[finSemana.month()]}`;

        setRangoSemana(`${inicioFormateado} a las 22:00 hasta ${finFormateado} a las 21:59`);

        // Filtrar registros entre inicioSemana y finSemana
        const registrosFiltrados = registros.filter((registro) => {
          const hora = registro.hour || "";
          const horaCompleta = hora.length === 5 ? hora + ":00" : hora; // si viene "HH:mm" -> "HH:mm:00"
          const fechaHora = moment.tz(
            `${registro.fecha} ${horaCompleta}`,
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
      <h2 className="text-4xl font-bold mb-8 text-center text-green-400">Bonos Base Producción</h2>
      <div className="mb-8">
        <p className="text-3xl font-semibold">Trabajos enviados de la semana:</p>
        <p className="text-5xl font-bold text-green-400">{totalHits.toLocaleString("es-MX")}</p>
      </div>
      <div className="mb-8">
        <p className="text-3xl font-semibold">Bono acumulado de la semana:</p>
        <p className="text-5xl font-bold text-green-400">
          {bono.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
        </p>
      </div>
      <div className="text-center text-gray-400 text-lg">
        <span className="block">{rangoSemana}</span>
      </div>
    </div>
  );
};

export default CardBonosProduccion;