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

const Totales_HardCoat_Maquina = () => {
  const maquinas = ['46 MR3.4', '48 MR3.1', '49 MR3.2', '50 MR3.3', '91 VELOCITY 1', '92 VELOCITY 2'];

  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 300000); // Actualiza cada 5 minutos
    return () => clearInterval(interval);
  }, []);

  const [seccionesAbiertas, setSeccionesAbiertas] = useState({});
  const toggleSeccion = (seccion) => {
    setSeccionesAbiertas(prev => ({ ...prev, [seccion]: !prev[seccion] }));
  };

  const [registros, setRegistros] = useState({});
  const [horasUnicas, setHorasUnicas] = useState([]);
  const [totalesAcumulados, setTotalesAcumulados] = useState({});
  const [totalesPorTurno, setTotalesPorTurno] = useState({});

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
          const fechaHoraRegistro = moment.tz(`${registro.fecha} ${registro.hour}`, 'YYYY-MM-DD HH:mm:ss', 'America/Mexico_City');
          return fechaHoraRegistro.isBetween(inicioHoy, finHoy, null, '[]') &&
            maquinas.some(maquina => registro.name.includes(maquina.split(' ')[0]));
        });

        const registrosPorMaquina = maquinas.reduce((acc, maquina) => {
          acc[maquina] = registrosFiltrados.filter(registro => registro.name.includes(maquina.split(' ')[0]));
          return acc;
        }, {});

        const horas = new Set();
        const totalesAcumuladosPorMaquina = {};
        const totalesPorTurnoYMaquina = { matutino: 0, vespertino: 0, nocturno: 0 };

        maquinas.forEach(maquina => {
          let totalAcumulado = 0;
          registrosPorMaquina[maquina].forEach(registro => {
            horas.add(registro.hour);
            totalAcumulado += parseInt(registro.hits || 0);
            const fechaHoraRegistro = moment.tz(`${registro.fecha} ${registro.hour}`, 'YYYY-MM-DD HH:mm:ss', 'America/Mexico_City');
            
            if (fechaHoraRegistro.isBetween(inicioHoy, moment(inicioHoy).add(8, 'hours'), null, '[)')) {
              totalesPorTurnoYMaquina.matutino += parseInt(registro.hits || 0);
            } else if (fechaHoraRegistro.isBetween(moment(inicioHoy).add(8, 'hours'), moment(inicioHoy).add(15, 'hours'), null, '[)')) {
              totalesPorTurnoYMaquina.vespertino += parseInt(registro.hits || 0);
            } else {
              totalesPorTurnoYMaquina.nocturno += parseInt(registro.hits || 0);
            }
          });
          totalesAcumuladosPorMaquina[maquina] = totalAcumulado;
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
        setTotalesAcumulados(totalesAcumuladosPorMaquina);
        setRegistros(registrosPorMaquina);
        setTotalesPorTurno(totalesPorTurnoYMaquina);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };
    cargarDatos();
  }, []);

  const sumaHitsPorHora = horasUnicas.map(hora => {
    const [horaInicio, horaFin] = hora.split(' - ');
    return maquinas.reduce((total, maquina) => {
      return total + (registros[maquina] || []).filter(r => {
        const hourMoment = moment(r.hour, 'HH:mm:ss');
        const startMoment = moment(horaInicio, 'HH:mm');
        const endMoment = moment(horaFin, 'HH:mm');
        if (startMoment.isAfter(endMoment)) {
          return hourMoment.isSameOrAfter(startMoment) || hourMoment.isBefore(endMoment);
        } else {
          return hourMoment.isSameOrAfter(startMoment) && hourMoment.isBefore(endMoment);
        }
      }).reduce((acc, curr) => acc + parseInt(curr.hits || 0), 0);
    }, 0);
  });

  return (
    <div className="max-w-screen-xl">
      {/* Diseño tipo card para pantallas pequeñas y medianas */}
      <div className="lg:hidden mt-4">
        {maquinas.map(maquina => (
          <SeccionMenu 
            key={maquina}
            titulo={maquina}
            isOpen={seccionesAbiertas[maquina] || false}
            toggle={() => toggleSeccion(maquina)}
          >
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="flex justify-between border-b pb-2">
                <span className="font-bold text-gray-700">Total Acumulado:</span>
                <span className="font-bold">{totalesAcumulados[maquina]}</span>
              </div>
              <div className="py-4">
                <span className="font-bold text-gray-700">Horas:</span>
                {horasUnicas.map((hora, idx) => {
                  const [horaInicio, horaFin] = hora.split(' - ');
                  const totalHits = (registros[maquina] || []).filter(r => {
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
                  return (
                    <div key={idx} className={`flex justify-between py-2 px-4 ${bgColor}`}>
                      <span className="font-bold text-gray-700">{hora}:</span>
                      <span className="font-bold">{totalHits}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </SeccionMenu>
        ))}
      </div>
      {/* Diseño de tabla para pantallas grandes */}
      <div className="hidden lg:block">
        <Navegacion/>
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="py-2 px-4 border-b" style={{ minWidth: '250px' }}>Nombre</th>
              <th className="py-2 px-4 border-b">Total Acumulado</th>
              {horasUnicas.map((hora, index) => (
                <th key={index} className="py-2 px-4 border-b whitespace-nowrap">{hora}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-center">
            {maquinas.map(maquina => (
              <tr key={maquina} className="font-semibold text-gray-700">
                <td className="py-2 px-4 border-b font-bold" style={{ minWidth: '250px' }}>{maquina}</td>
                <td className="py-2 px-4 border-b font-bold">{totalesAcumulados[maquina]}</td>
                {horasUnicas.map((hora, idx) => {
                  const [horaInicio, horaFin] = hora.split(' - ');
                  const totalHits = (registros[maquina] || []).filter(r => {
                    const hourMoment = moment(r.hour, 'HH:mm:ss');
                    const startMoment = moment(horaInicio, 'HH:mm');
                    const endMoment = moment(horaFin, 'HH:mm');
                    if (startMoment.isAfter(endMoment)) {
                      return hourMoment.isSameOrAfter(startMoment) || hourMoment.isBefore(endMoment);
                    } else {
                      return hourMoment.isSameOrAfter(startMoment) && hourMoment.isBefore(endMoment);
                    }
                  }).reduce((acc, curr) => acc + parseInt(curr.hits || 0), 0);
                  return (
                    <td key={idx} className="font-bold py-2 px-4 border-b">
                      {totalHits}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="font-semibold bg-green-200 text-gray-700">
              <td className="py-2 px-4 border-b font-bold" style={{ minWidth: '250px' }}>Totales</td>
              <td className="py-2 px-4 border-b fw font-bold">
                {Object.values(totalesAcumulados).reduce((a, b) => a + b, 0)}
              </td>
              {sumaHitsPorHora.map((sumaHits, index) => (
                <td key={index} className="font-bold py-2 px-4 border-b fw">{sumaHits}</td>
              ))}
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
              <span className="text-lg">{totalesPorTurno.matutino}</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Turno Vespertino</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total:</span>
              <span className="text-lg">{totalesPorTurno.vespertino}</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Turno Nocturno</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total:</span>
              <span className="text-lg">{totalesPorTurno.nocturno}</span>
            </div>
          </div>
        </div>
        {/* Diseño para pantallas grandes */}
        <div className='hidden lg:flex lg:flex-row justify-around'>
          <div className="bg-white p-2 px-10 rounded-lg">
            <p className="text-gray-600 text-base">
              Total Matutino: {totalesPorTurno.matutino}
            </p>
          </div>
          <div className="bg-white p-2 px-10 rounded-lg">
            <p className="text-gray-600 text-base">
              Total Vespertino: {totalesPorTurno.vespertino}
            </p>
          </div>
          <div className="bg-white p-2 px-10 rounded-lg">
            <p className="text-gray-600 text-base">
              Total Nocturno: {totalesPorTurno.nocturno}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Totales_HardCoat_Maquina;