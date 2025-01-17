import { useState, useEffect } from "react";
import clienteAxios from "../../../config/clienteAxios";
import moment from "moment";

const estaciones = {
  "Surtido": ["19 LENS LOG", "20 LENS LOG"],
  "Bloqueo de tallado": ["220 SRFBLK 1", "221 SRFBLK 2", "222 SRFBLK 3", "223 SRFBLK 4", "224 SRFBLK 5", "225 SRFBLK 6"],
  "Generado": ["241 GENERATOR 1", "242 GENERATOR 2", "245 ORBIT 1 LA", "246 ORBIT 2 LA", "244 ORBIT 3 LA", "243 ORBIT 4 LA", "247 SCHNIDER 1", "248 SCHNIDER 2"],
  "Pulido": ["255 POLISHR 1", "257 POLISHR 3", "259 POLISHR 5", "262 POLISHR 8", "265 POLISHR 12", "266 MULTIFLEX 1", "267 MULTIFLEX 2", "268 MULTIFLEX 3", "269 MULTIFLEX 4", "254 IFLEX SRVR"],
  "Engraver": ["270 ENGRVR 1", "271 ENGRVR 2", "272 ENGRVR 3", "273 ENGRVR 4"],
  "Desbloqueo": ["320 DEBLOCKING 1"],
  "AntiReflejante": ["91 VELOCITY 1", "92 VELOCITY 2", "52 FUSION", "53 1200 D", "55 TLF 1200.1", "56 TLF 1200.2"],
  "Bloqueo de terminado": ["280 FINBLKR 1", "281 FINBLKR 2", "282 FINBLKR 3"],
  "Biselado": ["298 DOUBLER", "299 BISPHERA", "300 EDGER 1", "301 EDGER 2", "302 EDGER 3", "303 EDGER 4", "304 EDGER 5", "305 EDGER 6", "306 EDGER 7", "307 EDGER 8", "308 EDGER 9", "309 EDGER 10", "310 EDGER 11", "311 EDFGER 12", "313 EDGER 13", "314 EDGER 14", "316 EDGER 15", "317 EDGER 16", "327 EDGER 17", "328 EDGER 18", "329 EDGER 19", "330 EDGER 20", "331 EDGER 21", "332 EDGER 22", "333 EDGER 23", "334 EDGER 24", "312 RAZR", "318 HSE 1", "319 HSE 2"],
  "Producción": ["32 JOB COMPLETE"],
};

// Mapeo de nombres
const nombreMostrar = {
  "19 LENS LOG": "19 LENS LOG SF",
  "20 LENS LOG": "20 LENS LOG FIN"
};

const Historial_Por_Rangos = () => {
  const hoy = moment();
  const ayer = moment(hoy).subtract(1, 'days');
  const [anio, setAnio] = useState(ayer.format('YYYY'));
  const [mes, setMes] = useState(ayer.format('MM'));
  const [diaInicio, setDiaInicio] = useState(ayer.format('DD'));
  const [diaFin, setDiaFin] = useState(ayer.format('DD'));
  const [registros, setRegistros] = useState([]);

  const handleAnioChange = (e) => setAnio(e.target.value);
  const handleMesChange = (e) => setMes(e.target.value);
  const handleDiaInicioChange = (e) => setDiaInicio(e.target.value);
  const handleDiaFinChange = (e) => setDiaFin(e.target.value);

  useEffect(() => {
    const obtenerRegistros = async () => {
      try {
        const fechaInicio = moment(`${anio}-${mes}-${diaInicio} 06:30`);
        const fechaFin = moment(`${anio}-${mes}-${diaFin} 06:30`).add(1, 'days');
        const { data } = await clienteAxios(`/historial/historial-3/${anio}/${mes}/${diaInicio}/${moment(fechaFin).format('DD')}`);
        const registrosFiltrados = data.registros.filter(registro => {
          const fechaHora = moment(`${registro.fecha} ${registro.hour}`);
          return fechaHora.isSameOrAfter(fechaInicio) && fechaHora.isBefore(fechaFin);
        });
        console.log("Datos filtrados:", registrosFiltrados);
        setRegistros(registrosFiltrados);
      } catch (error) {
        console.error("Error al obtener los registros:", error);
        setRegistros([]);
      }
    };
    obtenerRegistros();
  }, [anio, mes, diaInicio, diaFin]);

  const registrosAgrupados = registros.reduce((acc, registro) => {
    const { name, hits, hour } = registro;
    if (!acc[name]) {
      acc[name] = { hits: 0, turnos: { matutino: 0, vespertino: 0, nocturno: 0 } };
    }
    acc[name].hits += hits;
    const hora = moment(hour, 'HH:mm');
    if (hora.isBetween(moment('06:30', 'HH:mm'), moment('14:29', 'HH:mm'), null, '[]')) {
      acc[name].turnos.matutino += hits;
    } else if (hora.isBetween(moment('14:30', 'HH:mm'), moment('21:29', 'HH:mm'), null, '[]')) {
      acc[name].turnos.vespertino += hits;
    } else {
      acc[name].turnos.nocturno += hits;
    }
    return acc;
  }, {});

  const hitsPorEstacionYTurno = Object.entries(estaciones).reduce((acc, [nombreEstacion, maquinas]) => {
    acc[nombreEstacion] = { matutino: 0, vespertino: 0, nocturno: 0 };
    maquinas.forEach(maquina => {
      const registro = registrosAgrupados[maquina];
      if (registro) {
        acc[nombreEstacion].matutino += registro.turnos.matutino;
        acc[nombreEstacion].vespertino += registro.turnos.vespertino;
        acc[nombreEstacion].nocturno += registro.turnos.nocturno;
      }
    });
    return acc;
  }, {});

  const totalHitsPorTurno = Object.values(hitsPorEstacionYTurno).reduce((acc, { matutino, vespertino, nocturno }) => {
    acc.matutino += matutino;
    acc.vespertino += vespertino;
    acc.nocturno += nocturno;
    return acc;
  }, { matutino: 0, vespertino: 0, nocturno: 0 });

  const totalHits = Object.values(registrosAgrupados).reduce((acc, { hits }) => acc + hits, 0);

  const renderizarTablasPorEstacion = () => {
    const fechaInicio = moment(`${anio}-${mes}-${diaInicio} 06:30`);
    const fechaFin = moment(`${anio}-${mes}-${diaFin} 06:30`).add(1, 'days');
    const rangoFecha = `${fechaInicio.format('YYYY-MM-DD HH:mm')} - ${fechaFin.format('YYYY-MM-DD HH:mm')}`;
    return Object.entries(estaciones).map(([nombreEstacion, maquinas]) => {
      const registrosEstacion = maquinas.map((maquina) => registrosAgrupados[maquina]).filter(Boolean);
      if (registrosEstacion.length === 0) return null;
      const totalHitsEstacion = registrosEstacion.reduce((total, registro) => total + registro.hits, 0);
      const turnosEstacion = hitsPorEstacionYTurno[nombreEstacion];
      return (
        <div key={nombreEstacion} className="mb-8">
          <p className="md:hidden text-center mb-2 text-sm text-gray-600">
            Rango de Fecha: {rangoFecha}
          </p>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full bg-white border border-gray-300 shadow-lg rounded-lg table-fixed">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th className="w-1/3 py-2 px-4 border-b text-center font-medium">Nombre</th>
                  <th className="w-1/3 py-2 px-4 border-b text-center font-medium">Rango de Fecha</th>
                  <th className="w-1/3 py-2 px-4 border-b text-center font-medium">Hits</th>
                </tr>
              </thead>
              <tbody>
                {registrosEstacion.map((registro, index) => {
                  const maquina = maquinas[index];
                  const nombreMostrarMaquina = nombreMostrar[maquina] || maquina; // Usa el nombre mapeado si existe
                  return (
                    <tr key={index} className="bg-white even:bg-gray-100">
                      <td className="w-1/3 py-2 px-4 border-b text-center">{nombreMostrarMaquina}</td>
                      <td className="w-1/3 py-2 px-4 border-b text-center">{rangoFecha}</td>
                      <td className="w-1/3 py-2 px-4 border-b text-center">{registro.hits}</td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-200">
                  <td className="py-2 px-4 border-b text-center font-bold text-gray-600" colSpan="2">Total</td>
                  <td className="py-2 px-4 border-b text-center text-blue-700 font-bold">{totalHitsEstacion}</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="py-2 px-4 border-b text-center font-bold text-gray-600" colSpan="2">Turnos: </td>
                  <td className="py-2 px-4 border-b text-center">
                    <div className="flex justify-between">
                      <span>Matutino: <strong className="text-gray-600">{turnosEstacion.matutino}</strong></span>
                      <span>Vespertino: <strong className="text-gray-600">{turnosEstacion.vespertino}</strong></span>
                      <span>Nocturno: <strong className="text-gray-600">{turnosEstacion.nocturno}</strong></span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="md:hidden bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-500 text-white p-3">
              <h3 className="text-lg font-semibold">{nombreEstacion}</h3>
            </div>
            <div className="p-4 space-y-4">
              {registrosEstacion.map((registro, index) => {
                const maquina = maquinas[index];
                const nombreMostrarMaquina = nombreMostrar[maquina] || maquina; // Usa el nombre mapeado si existe
                return (
                  <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="font-medium text-gray-700">{nombreMostrarMaquina}</span>
                    <div className="text-right">
                      <span className="block">{registro.hits}</span>
                      <span className="text-xs text-gray-500">Hits</span>
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between items-center pt-2 border-gray-200">
                <span className="font-semibold text-gray-700">Total Hits</span>
                <span className="font-bold text-blue-600">{totalHitsEstacion}</span>
              </div>
            </div>
            <div className="bg-green-50 p-4 border-t border-gray-200">
              <h4 className="font-semibold text-green-700 mb-2">Turnos</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="block text-gray-600">Matutino</span>
                  <span className="font-bold text-gray-500">{turnosEstacion.matutino}</span>
                </div>
                <div>
                  <span className="block text-gray-600">Vespertino</span>
                  <span className="font-bold text-gray-500">{turnosEstacion.vespertino}</span>
                </div>
                <div>
                  <span className="block text-gray-600">Nocturno</span>
                  <span className="font-bold text-gray-500">{turnosEstacion.nocturno}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div>
          <label className="block mb-1 sm:mb-2 text-gray-600">Año</label>
          <select className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg" value={anio} onChange={handleAnioChange}>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 sm:mb-2 text-gray-600">Mes</label>
          <select className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg" value={mes} onChange={handleMesChange}>
            {[...Array(12).keys()].map((m) => (
              <option key={m + 1} value={(m + 1).toString().padStart(2, '0')}>
                {moment().month(m).format('MMMM')}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 sm:mb-2 text-gray-600">Día Inicio</label>
          <select className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg" value={diaInicio} onChange={handleDiaInicioChange}>
            {[...Array(31).keys()].map((day) => (
              <option key={day + 1} value={(day + 1).toString().padStart(2, '0')}>{day + 1}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 sm:mb-2 text-gray-600">Día Fin</label>
          <select className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg" value={diaFin} onChange={handleDiaFinChange}>
            {[...Array(31).keys()].map((day) => (
              <option key={day + 1} value={(day + 1).toString().padStart(2, '0')}>{day + 1}</option>
            ))}
          </select>
        </div>
      </div>
      {renderizarTablasPorEstacion()}
    </div>
  );
};

export default Historial_Por_Rangos;