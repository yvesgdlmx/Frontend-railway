import { useEffect, useState, useRef } from "react";
import clienteAxios from "../../../config/clienteAxios";
import Navegacion from "../others/Navegacion";
import moment from 'moment-timezone';
import { ChevronDownIcon, ChevronUpIcon, CogIcon } from '@heroicons/react/24/solid';

// Componente para el título desplegable
const TituloSeccion = ({ titulo, isOpen, toggle }) => (
  <div 
    className="flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100 p-4 py-6 cursor-pointer rounded-lg shadow-sm border border-gray-200 transition-all duration-300 ease-in-out hover:shadow-md"
    onClick={toggle}
  >
    <div className="flex items-center space-x-3">
      <CogIcon className="h-6 w-6 text-blue-300" />
      <h2 className="font-semibold text-gray-600">{titulo}</h2>
    </div>
    {isOpen ? <ChevronUpIcon className="h-5 w-5 text-gray-500" /> : <ChevronDownIcon className="h-5 w-5 text-gray-500" />}
  </div>
);

const SeccionMenu = ({ titulo, isOpen, toggle, children }) => {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (isOpen) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen]);
  return (
    <div className="overflow-hidden mb-4">
      <TituloSeccion 
        titulo={titulo} 
        isOpen={isOpen} 
        toggle={toggle}
      />
      <div 
        ref={contentRef}
        style={{ maxHeight: isOpen ? `${height}px` : '0px' }}
        className={`
          transition-all duration-300 ease-in-out
          ${isOpen ? 'opacity-100 mt-4' : 'opacity-0'}
        `}
      >
        {children}
      </div>
    </div>
  );
};

const Totales_Tallado_Maquina = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 300000); // Actualiza cada 5 minutos
    return () => clearInterval(interval);
  }, []);

  const [seccionesAbiertas, setSeccionesAbiertas] = useState({});
  const toggleSeccion = (celula) => {
    setSeccionesAbiertas(prev => ({ ...prev, [celula]: !prev[celula] }));
  };

  const [totalesPorTurnoYMaquina, setTotalesPorTurnoYMaquina] = useState({});
  const [horasUnicas, setHorasUnicas] = useState([]);
  const [metasPorMaquina, setMetasPorMaquina] = useState({});
  const [totalesAcumulados, setTotalesAcumulados] = useState({});
  const [registrosAgrupados, setRegistrosAgrupados] = useState({});
  const [totalesPorTurno, setTotalesPorTurno] = useState({
    matutino: 0,
    vespertino: 0,
    nocturno: 0
  });
  const [metasPorTurno, setMetasPorTurno] = useState({
    matutino: 0,
    vespertino: 0,
    nocturno: 0
  });

  const ordenCelulas = [
    "220 SRFBLK 1",
    "221 SRFBLK 2",
    "222 SRFBLK 3",
    "223 SRFBLK 4",
    "224 SRFBLK 5",
    "225 SRFBLK 6",
  ];

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const responseMetas = await clienteAxios('/metas/metas-tallados');
        const metas = {};
        if (Array.isArray(responseMetas.data.registros)) {
          responseMetas.data.registros.forEach(meta => {
            metas[meta.name.trim().toUpperCase().replace(/\s+/g, ' ')] = meta.meta;
          });
        } else {
          console.error("La respuesta de las metas no contiene un array válido:", responseMetas.data);
        }
        setMetasPorMaquina(metas);

        const responseRegistros = await clienteAxios('/tallado/tallado/actualdia');
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

        const totalesPorMaquina = calcularTotalesPorTurnoYMaquina(registrosFiltrados, inicioHoy);
        setTotalesPorTurnoYMaquina(totalesPorMaquina);

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
          const [horaInicial, minutos] = hora.split(':');
          const momentoInicial = moment(hora, 'HH:mm:ss');
          const momentoFinal = moment(momentoInicial).add(1, 'hour');
          return `${horaInicial}:${minutos} - ${momentoFinal.format('HH:mm')}`;
        });

        setHorasUnicas(horasConFormato);
        setTotalesAcumulados(acumulados);
        calcularTotalesPorTurno(registrosFiltrados, inicioHoy);
        calcularMetasPorTurno(Object.values(metas).reduce((a, b) => a + b, 0));

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

  const calcularMetasPorTurno = (metaPorHora) => {
    setMetasPorTurno({
      matutino: 7 * metaPorHora,
      vespertino: 6 * metaPorHora,
      nocturno: 7 * metaPorHora
    });
  };

  const sumaTotalAcumulados = Object.values(totalesAcumulados).reduce((acc, curr) => acc + curr, 0);
  const sumaTotalMetas = Object.keys(metasPorMaquina).reduce((acc, celula) => {
    return acc + (metasPorMaquina[celula] || 0);
  }, 0);

  const sumaHitsPorHora = horasUnicas.map(hora => {
    const [horaInicio, horaFin] = hora.split(' - ');
    return Object.values(registrosAgrupados).flat().filter(r => {
      const hourMoment = moment(r.hour, 'HH:mm:ss');
      const startMoment = moment(horaInicio, 'HH:mm');
      const endMoment = moment(horaFin, 'HH:mm');
      if (startMoment.isAfter(endMoment)) {
        return hourMoment.isSameOrAfter(startMoment) || hourMoment.isBefore(endMoment);
      } else {
        return hourMoment.isSameOrAfter(startMoment) && hourMoment.isBefore(endMoment);
      }
    }).reduce((acc, curr) => acc + parseInt(curr.hits || 0), 0);
  });

  const claseSumaTotalAcumulados = sumaTotalAcumulados >= (metasPorTurno.matutino + metasPorTurno.vespertino + metasPorTurno.nocturno) ? "text-green-500" : "text-red-500";

  const getClassName = (hits, metaPorTurno) => {
    return hits >= metaPorTurno ? "text-green-500" : "text-red-500";
  };

  const calcularTotalesPorTurnoYMaquina = (registros, inicioHoy) => {
    const totales = {};
    ordenCelulas.forEach(celula => {
      totales[celula] = {
        matutino: 0,
        vespertino: 0,
        nocturno: 0
      };
    });
    registros.forEach(registro => {
      const celula = registro.name.split("-")[0].trim().toUpperCase().replace(/\s+/g, ' ');
      const fechaHoraRegistro = moment.tz(`${registro.fecha} ${registro.hour}`, 'YYYY-MM-DD HH:mm:ss', 'America/Mexico_City');
      if (fechaHoraRegistro.isBetween(inicioHoy, moment(inicioHoy).add(8, 'hours'), null, '[)')) {
        totales[celula].matutino += parseInt(registro.hits || 0);
      } else if (fechaHoraRegistro.isBetween(moment(inicioHoy).add(8, 'hours'), moment(inicioHoy).add(15, 'hours'), null, '[)')) {
        totales[celula].vespertino += parseInt(registro.hits || 0);
      } else {
        totales[celula].nocturno += parseInt(registro.hits || 0);
      }
    });
    return totales;
  };

  return (
    <>
      <div className="max-w-screen-xl">
       {/* Diseño tipo card para pantallas pequeñas y medianas */}
      <div className="lg:hidden mt-4">
      {ordenCelulas.map((celula, index) => {
        const registrosCelula = registrosAgrupados[celula] || [];
        const totalAcumulado = totalesAcumulados[celula] || 0;
        const meta = metasPorMaquina[celula] || 0;
        const metaAcumulada = meta * horasUnicas.length;
        const claseTotalAcumulado = totalAcumulado >= metaAcumulada ? "text-green-500" : "text-red-500";
        const totalesTurno = totalesPorTurnoYMaquina[celula];
    // Calcular horas transcurridas en cada turno
    const horasMatutino = Math.min(moment().diff(moment().startOf('day').add(6, 'hours').add(30, 'minutes'), 'hours'), 8);
    const horasVespertino = Math.min(Math.max(moment().diff(moment().startOf('day').add(14, 'hours').add(30, 'minutes'), 'hours'), 0), 7);
    const horasNocturno = Math.min(Math.max(moment().diff(moment().startOf('day').add(21, 'hours').add(30, 'minutes'), 'hours'), 0), 9);
    // Calcular metas ajustadas según horas transcurridas
    const metaMatutino = meta * horasMatutino;
    const metaVespertino = meta * horasVespertino;
    const metaNocturno = meta * horasNocturno;
    return (
      <SeccionMenu 
        key={index}
        titulo={celula}
        isOpen={seccionesAbiertas[celula] || false}
        toggle={() => toggleSeccion(celula)}
      >
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between border-b pb-2">
            <span className="font-bold text-gray-700">Total Acumulado:</span>
            <span className={`font-bold ${claseTotalAcumulado}`}>{totalAcumulado}</span>
          </div>
          <div className="flex justify-between border-b py-4">
            <span className="font-bold text-gray-700">Meta:</span>
            <span className="font-bold text-gray-700">{meta || 'No definida'}</span>
          </div>
          <div className="flex justify-between border-b py-4">
            <span className="font-bold text-gray-700">Meta Acumulada:</span>
            <span className="font-bold text-gray-700">{metaAcumulada}</span>
          </div>
          <div className="flex justify-between border-b py-4">
            <span className="font-bold text-gray-700">T. Matutino:</span>
            <span className={`font-bold ${(totalesTurno?.matutino || 0) > 0 && totalesTurno?.matutino >= metaMatutino ? "text-green-500" : "text-red-500"}`}>
              {totalesTurno?.matutino || 0}
            </span>
          </div>
          <div className="flex justify-between border-b py-4">
            <span className="font-bold text-gray-700">T. Vespertino:</span>
            <span className={`font-bold ${(totalesTurno?.vespertino || 0) > 0 && totalesTurno?.vespertino >= metaVespertino ? "text-green-500" : "text-red-500"}`}>
              {totalesTurno?.vespertino || 0}
            </span>
          </div>
          <div className="flex justify-between border-b py-4">
            <span className="font-bold text-gray-700">T. Nocturno:</span>
            <span className={`font-bold ${(totalesTurno?.nocturno || 0) > 0 && totalesTurno?.nocturno >= metaNocturno ? "text-green-500" : "text-red-500"}`}>
              {totalesTurno?.nocturno || 0}
            </span>
          </div>
          <div className="py-4">
            <span className="font-bold text-gray-700">Horas:</span>
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
              const bgColor = idx % 2 === 0 ? 'bg-slate-200' : 'bg-slate-300';
              const hitsClass = totalHits >= meta ? "text-green-500" : "text-red-500";
              return (
                <div key={idx} className={`flex justify-between py-2 px-4 ${bgColor}`}>
                  <span className="font-bold text-gray-700">{hora}:</span>
                  <span className={`font-bold ${hitsClass}`}>{totalHits}</span>
                </div>
              );
            })}
          </div>
        </div>
      </SeccionMenu>
    );
  })}
</div>
        {/* Diseño de tabla para pantallas grandes */}
        <div className="hidden lg:block">
          <Navegacion/>
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="py-2 px-4 border-b" style={{ minWidth: '150px' }}>Nombre</th>
                <th className="py-2 px-4 border-b">Total Acumulado</th>
                <th className="py-2 px-4 border-b">Meta</th>
                <th className="py-2 px-4 border-b">Meta Acumulada</th> {/* Nueva columna */}
                <th className="py-2 px-4 border-b">T. Matutino</th>
                <th className="py-2 px-4 border-b">T. Vespertino</th>
                <th className="py-2 px-4 border-b">T. Nocturno</th>
                {horasUnicas.map((hora, index) => (
                  <th key={index} className="py-2 px-4 border-b whitespace-nowrap">{hora}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-center">
              {ordenCelulas.map((celula, index) => {
                const registrosCelula = registrosAgrupados[celula] || [];
                const totalAcumulado = totalesAcumulados[celula] || 0;
                const meta = metasPorMaquina[celula] || 0;
                const metaAcumulada = meta * horasUnicas.length;
                const totalesTurno = totalesPorTurnoYMaquina[celula];
                // Calcular horas transcurridas en cada turno
                const horasMatutino = Math.min(moment().diff(moment().startOf('day').add(6, 'hours').add(30, 'minutes'), 'hours'), 8);
                const horasVespertino = Math.min(Math.max(moment().diff(moment().startOf('day').add(14, 'hours').add(30, 'minutes'), 'hours'), 0), 7);
                const horasNocturno = Math.min(Math.max(moment().diff(moment().startOf('day').add(21, 'hours').add(30, 'minutes'), 'hours'), 0), 9);
                // Calcular metas ajustadas según horas transcurridas
                const metaMatutino = meta * horasMatutino;
                const metaVespertino = meta * horasVespertino;
                const metaNocturno = meta * horasNocturno;
                return (
                  <tr key={index} className={`font-semibold text-gray-700 ${index % 2 === 0 ? 'bg-gray-200' : 'bg-white'}`}>
                    <td className="py-2 px-4 border-b font-bold">{celula}</td>
                    <td className={`py-2 px-4 border-b font-bold ${totalAcumulado >= metaAcumulada ? "text-green-500" : "text-red-500"}`}>
                      {totalAcumulado}
                    </td>
                    <td className="py-2 px-4 border-b font-bold">{meta || 'No definida'}</td>
                    <td className="py-2 px-4 border-b font-bold">{metaAcumulada}</td> {/* Nueva columna */}
                    <td className={`py-2 px-4 border-b font-bold ${(totalesTurno?.matutino || 0) > 0 && totalesTurno?.matutino >= metaMatutino ? "text-green-500" : "text-red-500"}`}>
                      {totalesTurno?.matutino || 0}
                    </td>
                    <td className={`py-2 px-4 border-b font-bold ${(totalesTurno?.vespertino || 0) > 0 && totalesTurno?.vespertino >= metaVespertino ? "text-green-500" : "text-red-500"}`}>
                      {totalesTurno?.vespertino || 0}
                    </td>
                    <td className={`py-2 px-4 border-b font-bold ${(totalesTurno?.nocturno || 0) > 0 && totalesTurno?.nocturno >= metaNocturno ? "text-green-500" : "text-red-500"}`}>
                      {totalesTurno?.nocturno || 0}
                    </td>
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
                        <td key={idx} className={`font-bold py-2 px-4 border-b ${claseHitsIndividual}`}>
                          {totalHits}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              <tr className="font-semibold bg-green-200 text-gray-700">
                <td className="py-2 px-4 border-b font-bold">Totales</td>
                <td className={`py-2 px-4 border-b font-bold ${sumaTotalAcumulados >= (sumaTotalMetas * horasUnicas.length) ? "text-green-500" : "text-red-500"}`}>
                  {sumaTotalAcumulados}
                </td>
                <td className="py-2 px-4 border-b font-bold">{sumaTotalMetas}</td>
                <td className="py-2 px-4 border-b font-bold">{sumaTotalMetas * horasUnicas.length}</td> {/* Nueva columna */}
                <td className={`py-2 px-4 border-b font-bold ${totalesPorTurno.matutino > 0 && totalesPorTurno.matutino >= metasPorTurno.matutino ? "text-green-500" : "text-red-500"}`}>
                  {totalesPorTurno.matutino}
                </td>
                <td className={`py-2 px-4 border-b font-bold ${totalesPorTurno.vespertino > 0 && totalesPorTurno.vespertino >= metasPorTurno.vespertino ? "text-green-500" : "text-red-500"}`}>
                  {totalesPorTurno.vespertino}
                </td>
                <td className={`py-2 px-4 border-b font-bold ${totalesPorTurno.nocturno > 0 && totalesPorTurno.nocturno >= metasPorTurno.nocturno ? "text-green-500" : "text-red-500"}`}>
                  {totalesPorTurno.nocturno}
                </td>
                {sumaHitsPorHora.map((sumaHits, index) => {
                  const claseSumaHits = sumaHits >= sumaTotalMetas ? "text-green-500" : "text-red-500";
                  return (
                    <td key={index} className={`font-bold py-2 px-4 border-b ${claseSumaHits}`}>
                      {sumaHits}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
        {/* Totales por turno */}
    <div className='mt-4 font-semibold mb-4'>
      {/* Diseño para pantallas pequeñas y medianas */}
      <div className='lg:hidden space-y-4'>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Turno Matutino</h3>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total:</span>
            <span className={`text-lg ${getClassName(totalesPorTurno.matutino, metasPorTurno.matutino)}`}>
              {totalesPorTurno.matutino}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-gray-600">Meta:</span>
            <span className="text-lg font-bold text-gray-800">{metasPorTurno.matutino}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Turno Vespertino</h3>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total:</span>
            <span className={`text-lg ${getClassName(totalesPorTurno.vespertino, metasPorTurno.vespertino)}`}>
              {totalesPorTurno.vespertino}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-gray-600">Meta:</span>
            <span className="text-lg font-bold text-gray-800">{metasPorTurno.vespertino}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Turno Nocturno</h3>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total:</span>
            <span className={`text-lg ${getClassName(totalesPorTurno.nocturno, metasPorTurno.nocturno)}`}>
              {totalesPorTurno.nocturno}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-gray-600">Meta:</span>
            <span className="text-lg font-bold text-gray-800">{metasPorTurno.nocturno}</span>
          </div>
        </div>
      </div>
          {/* Diseño para pantallas grandes */}
          <div className='hidden lg:flex lg:flex-row justify-around'>
            <div className="bg-white p-2 px-10 rounded-lg">
              <p className="text-gray-600 text-base">
                Total Matutino: 
                <span className={getClassName(totalesPorTurno.matutino, metasPorTurno.matutino)}>
                  {totalesPorTurno.matutino}
                </span> 
                / Meta: <span className="text-gray-600 font-bold">{metasPorTurno.matutino}</span>
              </p>
            </div>
            <div className="bg-white p-2 px-10 rounded-lg">
              <p className="text-gray-600 text-base">
                Total Vespertino: 
                <span className={getClassName(totalesPorTurno.vespertino, metasPorTurno.vespertino)}>
                  {totalesPorTurno.vespertino}
                </span> 
                / Meta: <span className="text-gray-600 font-bold">{metasPorTurno.vespertino}</span>
              </p>
            </div>
            <div className="bg-white p-2 px-10 rounded-lg">
              <p className="text-gray-600 text-base">
                Total Nocturno: 
                <span className={getClassName(totalesPorTurno.nocturno, metasPorTurno.nocturno)}>
                  {totalesPorTurno.nocturno}
                </span> 
                / Meta: <span className="text-gray-600 font-bold">{metasPorTurno.nocturno}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Totales_Tallado_Maquina;