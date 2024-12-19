import { useState, useEffect, useRef } from "react";
import clienteAxios from "../../../config/clienteAxios";
import Navegacion from "../others/Navegacion";
import moment from 'moment-timezone';
import { ChevronDownIcon, ChevronUpIcon, CogIcon } from '@heroicons/react/24/solid';

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

const Totales_Surtido_Maquina = () => {
  const calcularHorasTranscurridas = (horasUnicas) => {
    return horasUnicas.length;
  };

  const evaluarTotalAcumulado = (total, meta, horasTranscurridas) => {
    const metaAcumulada = meta * horasTranscurridas;
    return total >= metaAcumulada ? "text-green-500" : "text-red-500";
  };

  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  const [seccionAbierta, setSeccionAbierta] = useState(false);
  const [registros, setRegistros] = useState([]);
  const [horasUnicas, setHorasUnicas] = useState([]);
  const [meta, setMeta] = useState(0);
  const [totalesAcumulados, setTotalesAcumulados] = useState(0);
  const [registrosPorTipo, setRegistrosPorTipo] = useState({
    '19 LENS LOG-SF': [],
    '20 LENS LOG-FIN': []
  });
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
  const [metaAcumulada, setMetaAcumulada] = useState(0); // Nueva variable para la meta acumulada

  const toggleSeccion = () => {
    setSeccionAbierta(!seccionAbierta);
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const responseMetas = await clienteAxios('/metas/metas-manuales');
        const metasLensLog = responseMetas.data.registros.filter(meta => meta.name.includes('LENS LOG'));
        const sumaMetas = metasLensLog.reduce((acc, meta) => acc + meta.meta, 0);
        setMeta(sumaMetas);
        calcularMetasPorTurno(sumaMetas);
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
          const fechaHoraRegistro = moment.tz(`${registro.fecha} ${registro.hour}`, 'YYYY-MM-DD HH:mm:ss', 'America/Mexico_City');
          return fechaHoraRegistro.isBetween(inicioHoy, finHoy, null, '[]') && registro.name.includes('LENS LOG');
        });
        procesarRegistros(registrosFiltrados, inicioHoy);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };
    cargarDatos();
  }, []);

  const calcularMetasPorTurno = (metaPorHora) => {
    setMetasPorTurno({
      matutino: 8 * metaPorHora,
      vespertino: 7 * metaPorHora,
      nocturno: 9 * metaPorHora
    });
  };

  const procesarRegistros = (registrosFiltrados, inicioHoy) => {
    const horas = new Set();
    let totalAcumulado = 0;
    const totales = { matutino: 0, vespertino: 0, nocturno: 0 };
    const registrosPorTipoTemp = {
      '19 LENS LOG-SF': [],
      '20 LENS LOG-FIN': []
    };
    registrosFiltrados.forEach(registro => {
      horas.add(registro.hour);
      totalAcumulado += parseInt(registro.hits || 0);
      if (registro.name.includes('19 LENS LOG-SF')) {
        registrosPorTipoTemp['19 LENS LOG-SF'].push(registro);
      } else if (registro.name.includes('20 LENS LOG-FIN')) {
        registrosPorTipoTemp['20 LENS LOG-FIN'].push(registro);
      }
      const fechaHoraRegistro = moment.tz(`${registro.fecha} ${registro.hour}`, 'YYYY-MM-DD HH:mm:ss', 'America/Mexico_City');
      if (fechaHoraRegistro.isBetween(inicioHoy, moment(inicioHoy).add(8, 'hours'), null, '[)')) {
        totales.matutino += parseInt(registro.hits || 0);
      } else if (fechaHoraRegistro.isBetween(moment(inicioHoy).add(8, 'hours'), moment(inicioHoy).add(15, 'hours'), null, '[)')) {
        totales.vespertino += parseInt(registro.hits || 0);
      } else {
        totales.nocturno += parseInt(registro.hits || 0);
      }
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
    setTotalesAcumulados(totalAcumulado);
    setRegistros(registrosFiltrados);
    setTotalesPorTurno(totales);
    setRegistrosPorTipo(registrosPorTipoTemp);
  };

  const horasTranscurridas = calcularHorasTranscurridas(horasUnicas);
  const claseTotal = evaluarTotalAcumulado(totalesAcumulados, meta, horasTranscurridas);

  // Calcular la meta acumulada
  useEffect(() => {
    const nuevaMetaAcumulada = (horasTranscurridas * (meta / 2)); // Divide entre 2 ya que la meta se establece como meta por hora
    setMetaAcumulada(nuevaMetaAcumulada);
  }, [horasTranscurridas, meta]);

  return (
    <div className="max-w-screen-xl">
      <div className="lg:hidden mt-4">
        <SeccionMenu titulo="Surtido" isOpen={seccionAbierta} toggle={toggleSeccion}>
          <div className="bg-white shadow-md rounded-lg p-6">
            {['19 LENS LOG-SF', '20 LENS LOG-FIN'].map((tipo, index) => (
              <div key={index} className="mb-4">
                <h3 className="font-bold text-gray-700 mb-2">{tipo}</h3>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-bold text-gray-700">Total:</span>
                  <span className={`font-bold ${claseTotal}`}>
                    {registrosPorTipo[tipo].reduce((acc, curr) => acc + parseInt(curr.hits || 0), 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SeccionMenu>
      </div>
      <div className="hidden lg:block">
        <Navegacion />
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="py-2 px-4 border-b" style={{ minWidth: '150px' }}>Nombre</th>
              <th className="py-2 px-4 border-b">Total Acumulado</th>
              <th className="py-2 px-4 border-b">Meta</th>
              <th className="py-2 px-4 border-b">Meta Acumulada</th> {/* Nueva columna */}
              {horasUnicas.map((hora, index) => (
                <th key={index} className="py-2 px-4 border-b whitespace-nowrap">{hora}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-center">
            {['19 LENS LOG-SF', '20 LENS LOG-FIN'].map((tipo, index) => (
              <tr key={index} className="font-semibold text-gray-700">
                <td className="py-2 px-4 border-b font-bold" style={{ minWidth: '150px' }}>{tipo}</td>
                <td className={`py-2 px-4 border-b font-bold ${claseTotal}`}>
                  {registrosPorTipo[tipo].reduce((acc, curr) => acc + parseInt(curr.hits || 0), 0)}
                </td>
                <td className="py-2 px-4 border-b font-bold">{meta / 2 || 'No definida'}</td>
                <td className="py-2 px-4 border-b font-bold">{metaAcumulada}</td> {/* Nueva columna */}
                {horasUnicas.map((hora, idx) => {
                  const [horaInicio, horaFin] = hora.split(' - ');
                  const totalHits = registrosPorTipo[tipo].filter(r => {
                    const hourMoment = moment(r.hour, 'HH:mm:ss');
                    const startMoment = moment(horaInicio, 'HH:mm');
                    const endMoment = moment(horaFin, 'HH:mm');
                    if (startMoment.isAfter(endMoment)) {
                      return hourMoment.isSameOrAfter(startMoment) || hourMoment.isBefore(endMoment);
                    } else {
                      return hourMoment.isSameOrAfter(startMoment) && hourMoment.isBefore(endMoment);
                    }
                  }).reduce((acc, curr) => acc + parseInt(curr.hits || 0), 0);
                  const claseHitsIndividual = totalHits >= (meta / 2) ? "text-green-500" : "text-red-500";
                  return (
                    <td key={idx} className={`font-bold py-2 px-4 border-b ${claseHitsIndividual}`}>
                      {totalHits}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="font-semibold bg-green-200 text-gray-700">
              <td className="py-2 px-4 border-b font-bold">Totales</td>
              <td className={`py-2 px-4 border-b font-bold ${claseTotal}`}>
                {totalesAcumulados}
              </td>
              <td className="py-2 px-4 border-b font-bold">{meta}</td>
              <td className="py-2 px-4 border-b font-bold">{metaAcumulada}</td> {/* Nueva columna */}
              {horasUnicas.map((hora, idx) => {
                const totalHora = Object.values(registrosPorTipo).reduce((acc, registros) => {
                  return acc + registros.filter(r => {
                    const [horaInicio, horaFin] = hora.split(' - ');
                    const hourMoment = moment(r.hour, 'HH:mm:ss');
                    const startMoment = moment(horaInicio, 'HH:mm');
                    const endMoment = moment(horaFin, 'HH:mm');
                    if (startMoment.isAfter(endMoment)) {
                      return hourMoment.isSameOrAfter(startMoment) || hourMoment.isBefore(endMoment);
                    } else {
                      return hourMoment.isSameOrAfter(startMoment) && hourMoment.isBefore(endMoment);
                    }
                  }).reduce((sum, curr) => sum + parseInt(curr.hits || 0), 0);
                }, 0);
                return (
                  <td key={idx} className={`font-bold py-2 px-4 border-b ${totalHora >= meta ? "text-green-500" : "text-red-500"}`}>
                    {totalHora}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Totales_Surtido_Maquina;