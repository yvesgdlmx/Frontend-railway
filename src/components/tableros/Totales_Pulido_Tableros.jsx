import { useEffect, useState } from "react";
import clienteAxios from "../../../config/clienteAxios";
import Navegacion from "../others/Navegacion";
import moment from 'moment-timezone';

const Totales_Pulido_Tableros = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 300000); // Actualiza cada 5 minutos
    return () => clearInterval(interval);
  }, []);

  const [registros, setRegistros] = useState([]);
  const [horasUnicas, setHorasUnicas] = useState([]);
  const [metasPorMaquina, setMetasPorMaquina] = useState({});
  const [totalesAcumulados, setTotalesAcumulados] = useState({});
  const [registrosAgrupados, setRegistrosAgrupados] = useState({});
  const [totalesPorTurno, setTotalesPorTurno] = useState({
    matutino: 0,
    vespertino: 0,
    nocturno: 0
  });

  const ordenCelulas = [
    "254 IFLEX SRVR",
    "255 POLISHR 1",
    "257 POLISHR 3",
    "258 POLISHR 4",
    "259 POLISHR 5",
    "260 POLISHR 6",
    "261 POLISHR 7",
    "262 POLISHR 8",
    "265 POLISHR 12",
    "266 MULTIFLEX 1",
    "267 MULTIFLEX 2",
    "268 MULTIFLEX 3",
    "269 MULTIFLEX 4",
  ];

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const responseMetas = await clienteAxios('/metas/metas-pulidos');
        const metas = {};
        if (Array.isArray(responseMetas.data.registros)) {
          responseMetas.data.registros.forEach(meta => {
            metas[meta.name.trim().toUpperCase().replace(/\s+/g, ' ')] = meta.meta;
          });
        } else {
          console.error("La respuesta de las metas no contiene un array válido:", responseMetas.data);
        }
        setMetasPorMaquina(metas);

        const responseRegistros = await clienteAxios('/pulido/pulido/actualdia');
        const dataRegistros = responseRegistros.data.registros || [];

        const ahora = moment().tz('America/Mexico_City');
        let inicioHoy = moment().tz('America/Mexico_City').startOf('day').add(6, 'hours').add(30, 'minutes');
        let finHoy = moment(inicioHoy).add(1, 'days');

        if (ahora.isBefore(inicioHoy)) {
          inicioHoy.subtract(1, 'days');
          finHoy.subtract(1, 'days');
        }

        const registrosFiltrados = dataRegistros.filter(registro => {
          const fechaHoraRegistro = moment.tz(`${registro.fecha} ${registro.hour}`, 'YYYY-MM-DD HH:mm:ss', 'America/Mexico_City');
          return fechaHoraRegistro.isBetween(inicioHoy, finHoy, null, '[]');
        });

        const registrosAgrupados = registrosFiltrados.reduce((acc, registro) => {
          const celula = registro.name.split("-")[0].trim().toUpperCase().replace(/\s+/g, ' ');
          if (!acc[celula]) {
            acc[celula] = [];
          }
          acc[celula].push(registro);
          return acc;
        }, {});

        setRegistrosAgrupados(registrosAgrupados);

        const horas = new Set();
        const acumulados = {};

        registrosFiltrados.forEach(registro => {
          horas.add(registro.hour);
          const celula = registro.name.split("-")[0].trim().toUpperCase().replace(/\s+/g, ' ');
          acumulados[celula] = (acumulados[celula] || 0) + parseInt(registro.hits || 0);
        });

        const horasArray = Array.from(horas).sort((a, b) => {
          const momentA = moment(a, 'HH:mm:ss');
          const momentB = moment(b, 'HH:mm:ss');
          if (momentA.isBefore(moment('06:30', 'HH:mm'))) momentA.add(1, 'day');
          if (momentB.isBefore(moment('06:30', 'HH:mm'))) momentB.add(1, 'day');
          return momentB.diff(momentA);
        });

        const horasConFormato = horasArray.map(hora => {
          const momentoInicial = moment(hora, 'HH:mm:ss');
          const momentoFinal = moment(momentoInicial).add(1, 'hour');
          return `${momentoInicial.format('HH:mm')} - ${momentoFinal.format('HH:mm')}`;
        });

        setHorasUnicas(horasConFormato);
        setTotalesAcumulados(acumulados);
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

  const sumaTotalAcumulados = Object.values(totalesAcumulados).reduce((acc, curr) => acc + curr, 0);
  const sumaTotalMetas = Object.keys(metasPorMaquina).reduce((acc, celula) => {
    return acc + (metasPorMaquina[celula] || 0);
  }, 0);
  const metaMatutinoFinal = sumaTotalMetas * 8;
  const metaVespertinoFinal = sumaTotalMetas * 7;
  const metaNocturnoFinal = sumaTotalMetas * 4;

  const sumaHitsPorHora = horasUnicas.map(hora => {
    const [horaInicio, horaFin] = hora.split(' - ');
    return ordenCelulas.reduce((total, celula) => {
      const registrosCelula = registrosAgrupados[celula] || [];
      const totalHits = registrosCelula.filter(r => {
        const hourMoment = moment(r.hour, 'HH:mm:ss');
        const startMoment = moment(horaInicio, 'HH:mm');
        const endMoment = moment(horaFin, 'HH:mm');
        if (startMoment.isAfter(endMoment)) {
          return hourMoment.isSameOrAfter(startMoment) || hourMoment.isBefore(endMoment);
        } else {
          return hourMoment.isSameOrAfter(startMoment) && hourMoment.isBefore(endMoment);
        }
      }).reduce((acc, curr) => acc + parseInt(curr.hits || 0), 0);
      return total + totalHits;
    }, 0);
  });

  const claseSumaTotalAcumulados = sumaTotalAcumulados >= (metaMatutinoFinal + metaVespertinoFinal + metaNocturnoFinal) ? "text-green-500" : "text-red-500";

  return (
    <>
      <div className="w-full px-4">
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full bg-white border text-sm font-bold">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="py-4 px-6 border-b" style={{ minWidth: '250px' }}>Nombre</th>
                <th className="py-4 px-6 border-b">Total Acumulado</th>
                <th className="py-4 px-6 border-b">Meta</th>
                {horasUnicas.map((hora, index) => (
                  <th key={index} className="py-4 px-6 border-b whitespace-nowrap">{hora}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-center">
              {ordenCelulas.map((celula, index) => {
                const registrosCelula = registrosAgrupados[celula] || [];
                const totalAcumulado = totalesAcumulados[celula] || 0;
                const meta = metasPorMaquina[celula] || 0;
                const metaAcumulada = meta * horasUnicas.length;
                const claseTotalAcumulado = totalAcumulado >= metaAcumulada ? "text-green-500" : "text-red-500";
                const bgColor = index % 2 === 0 ? 'bg-gray-200' : 'bg-white';
                return (
                  <tr key={index} className={`font-semibold text-gray-700 ${bgColor}`}>
                    <td className="py-4 px-6 border-b font-bold" style={{ minWidth: '250px' }}>{celula}</td>
                    <td className={`py-4 px-6 border-b font-bold ${claseTotalAcumulado}`}>{totalAcumulado}</td>
                    <td className="py-4 px-6 border-b font-bold">{meta || 'No definida'}</td>
                    {horasUnicas.map((hora, idx) => {
                      const [horaInicio, horaFin] = hora.split(' - ');
                      const totalHits = registrosCelula.filter(r => {
                        const hourMoment = moment(r.hour, 'HH:mm:ss');
                        const startMoment = moment(horaInicio, 'HH:mm');
                        const endMoment = moment(horaFin, 'HH:mm');
                        if (startMoment.isAfter(endMoment)) {
                          return hourMoment.isSameOrAfter(startMoment) || hourMoment.isBefore(endMoment);
                        } else {
                          return hourMoment.isSameOrAfter(startMoment) && hourMoment.isBefore(endMoment);
                        }
                      }).reduce((acc, curr) => acc + parseInt(curr.hits || 0), 0);
                      const claseHitsIndividual = totalHits >= meta ? "text-green-500" : "text-red-500";
                      return (
                        <td key={idx} className={`font-bold py-4 px-6 border-b ${claseHitsIndividual}`}>
                          {totalHits}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              <tr className="font-semibold bg-green-200 text-gray-700">
                <td className="py-4 px-6 border-b font-bold" style={{ minWidth: '250px' }}>Totales</td>
                <td className={`py-4 px-6 border-b fw font-bold ${claseSumaTotalAcumulados}`}>{sumaTotalAcumulados}</td>
                <td className="py-4 px-6 border-b fw font-bold">{sumaTotalMetas}</td>
                {sumaHitsPorHora.map((sumaHits, index) => {
                  const claseSumaHits = sumaHits >= sumaTotalMetas ? "text-green-500" : "text-red-500";
                  return (
                    <td key={index} className={`font-bold py-4 px-6 border-b fw ${claseSumaHits}`}>{sumaHits}</td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Totales_Pulido_Tableros;