import React, { useEffect, useState } from "react";
import clienteAxios from "../../../config/clienteAxios";
import moment from 'moment-timezone';

const Totales_Produccion_Tableros = () => {
  const [totalesPorTurno, setTotalesPorTurno] = useState({
    matutino: 0,
    vespertino: 0,
    nocturno: 0
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const responseRegistros = await clienteAxios('/manual/manual/actualdia');
        const dataRegistros = responseRegistros.data.registros || [];
        const ahora = moment().tz('America/Mexico_City');
        let inicioHoy = moment().tz('America/Mexico_City').startOf('day').add(6, 'hours').add(30, 'minutes');
        let finHoy = moment(inicioHoy).add(1, 'days');
        if (ahora.isBefore(inicioHoy)) {
          inicioHoy.subtract(1, 'days');
          finHoy.subtract(1, 'days');
        }
        const registrosFiltrados = dataRegistros.filter(registro => {
          const celula = registro.name.split("-")[0].trim().toUpperCase().replace(/\s+/g, ' ');
          return celula === "32 JOB COMPLETE";
        }).filter(registro => {
          const fechaHoraRegistro = moment.tz(`${registro.fecha} ${registro.hour}`, 'YYYY-MM-DD HH:mm:ss', 'America/Mexico_City');
          return fechaHoraRegistro.isBetween(inicioHoy, finHoy, null, '[]');
        });
        calcularTotalesPorTurno(registrosFiltrados, inicioHoy);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };
    cargarDatos();
  }, []);

  const calcularTotalesPorTurno = (registros, inicioHoy) => {
    const totales = {
      matutino: 0,
      vespertino: 0,
      nocturno: 0
    };
    registros.forEach(registro => {
      const fechaHoraRegistro = moment.tz(`${registro.fecha} ${registro.hour}`, 'YYYY-MM-DD HH:mm:ss', 'America/Mexico_City');
      if (fechaHoraRegistro.isBetween(inicioHoy, moment(inicioHoy).add(8, 'hours'), null, '[)')) {
        totales.matutino += parseInt(registro.hits || 0);
      } else if (fechaHoraRegistro.isBetween(moment(inicioHoy).add(8, 'hours'), moment(inicioHoy).add(15, 'hours'), null, '[)')) {
        totales.vespertino += parseInt(registro.hits || 0);
      } else {
        totales.nocturno += parseInt(registro.hits || 0);
      }
    });
    setTotalesPorTurno(totales);
  };

  const sumaTotalAcumulados = totalesPorTurno.matutino + totalesPorTurno.vespertino + totalesPorTurno.nocturno;

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
            <span className="text-2xl">Matutino:</span>
            <span className="text-3xl font-semibold">{totalesPorTurno.matutino}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-2xl">Vespertino:</span>
            <span className="text-3xl font-semibold">{totalesPorTurno.vespertino}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-2xl">Nocturno:</span>
            <span className="text-3xl font-semibold">{totalesPorTurno.nocturno}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Totales_Produccion_Tableros;