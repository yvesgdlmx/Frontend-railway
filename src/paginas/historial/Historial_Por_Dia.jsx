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

const Historial_Por_Dia = () => {
  const yesterday = moment().subtract(1, 'days');
  const [anio, setAnio] = useState(yesterday.format('YYYY'));
  const [mes, setMes] = useState(yesterday.format('MM'));
  const [dia, setDia] = useState(yesterday.format('DD'));
  const [registros, setRegistros] = useState([]);
  const [metas, setMetas] = useState({});

  const handleAnioChange = (e) => setAnio(e.target.value);
  const handleMesChange = (e) => setMes(e.target.value);
  const handleDiaChange = (e) => setDia(e.target.value);

  useEffect(() => {
    const obtenerRegistros = async () => {
      try {
        const fechaInicio = moment(`${anio}-${mes}-${dia} 06:30`);
        const fechaFin = moment(fechaInicio).add(1, 'days').set({hour: 6, minute: 29});

        const { data: dataDiaActual } = await clienteAxios(`/historial/historial-2/${anio}/${mes}/${dia}`);
        const { data: dataDiaSiguiente } = await clienteAxios(`/historial/historial-2/${fechaFin.format('YYYY')}/${fechaFin.format('MM')}/${fechaFin.format('DD')}`);

        const registrosCombinados = [
          ...dataDiaActual.registros.filter(r => {
            const hora = moment(r.hour, 'HH:mm');
            return hora.isSameOrAfter(moment('06:30', 'HH:mm'));
          }),
          ...dataDiaSiguiente.registros.filter(r => {
            const hora = moment(r.hour, 'HH:mm');
            return hora.isBefore(moment('06:30', 'HH:mm'));
          })
        ];

        console.log("Datos obtenidos de la API:", registrosCombinados);
        setRegistros(registrosCombinados);
      } catch (error) {
        console.error("Error al obtener los registros:", error);
        setRegistros([]);
      }
    };

    const obtenerMetas = async () => {
      try {
        const responseMetasTallados = await clienteAxios.get('/metas/metas-tallados');
        const responseMetasLensLog = await clienteAxios.get('/metas/metas-manuales');
        const responseMetasGeneradores = await clienteAxios.get('/metas/metas-generadores');
        const responseMetasPulidos = await clienteAxios.get('/metas/metas-pulidos');
        const responseMetasEngravers = await clienteAxios.get('/metas/metas-engravers');
        const responseMetasTerminados = await clienteAxios.get('/metas/metas-terminados');
        const responseMetasBiselados = await clienteAxios.get('/metas/metas-biselados');

        const metasPorMaquinaTallados = responseMetasTallados.data.registros.reduce((acc, curr) => {
          acc[curr.name] = curr.meta;
          return acc;
        }, {});
        const metasPorMaquinaLensLog = responseMetasLensLog.data.registros.reduce((acc, curr) => {
          if (curr.name.includes('LENS LOG') || curr.name.includes('JOB COMPLETE') || curr.name.includes('DEBLOCKING')) {
            acc[curr.name] = curr.meta;
          }
          return acc;
        }, {});
        const metasPorMaquinaGeneradores = responseMetasGeneradores.data.registros.reduce((acc, curr) => {
          acc[curr.name.toUpperCase().trim()] = curr.meta;
          return acc;
        }, {});
        const metasPorMaquinaPulidos = responseMetasPulidos.data.registros.reduce((acc, curr) => {
          acc[curr.name.toUpperCase().trim()] = curr.meta;
          return acc;
        }, {});
        const metasPorMaquinaEngravers = responseMetasEngravers.data.registros.reduce((acc, curr) => {
          acc[curr.name.toUpperCase().trim()] = curr.meta;
          return acc;
        }, {});
        const metasPorMaquinaTerminados = responseMetasTerminados.data.registros.reduce((acc, curr) => {
          acc[curr.name.toUpperCase().trim()] = curr.meta;
          return acc;
        }, {});
        const metasPorMaquinaBiselados = responseMetasBiselados.data.registros.reduce((acc, curr) => {
          acc[curr.name.toUpperCase().trim()] = curr.meta;
          return acc;
        }, {});

        setMetas({
          ...metasPorMaquinaTallados,
          ...metasPorMaquinaLensLog,
          ...metasPorMaquinaGeneradores,
          ...metasPorMaquinaPulidos,
          ...metasPorMaquinaEngravers,
          ...metasPorMaquinaTerminados,
          ...metasPorMaquinaBiselados,
        });
      } catch (error) {
        console.error("Error al obtener las metas:", error);
      }
    };

    obtenerRegistros();
    obtenerMetas();
  }, [anio, mes, dia]);

  const calcularMetasPorTurno = (metaPorHora) => ({
    matutino: metaPorHora * 8,
    vespertino: metaPorHora * 7,
    nocturno: metaPorHora * 9
  });

  const registrosAgrupados = registros.reduce((acc, registro) => {
    const { name, hits } = registro;
    if (!acc[name]) {
      acc[name] = { hits: 0, turnos: { matutino: 0, vespertino: 0, nocturno: 0 } };
    }
    acc[name].hits += hits;
    const hora = moment(registro.hour, 'HH:mm');
    
    if (hora.isBetween(moment('06:30', 'HH:mm'), moment('14:29', 'HH:mm'), null, '[]')) {
      acc[name].turnos.matutino += hits;
    } else if (hora.isBetween(moment('14:30', 'HH:mm'), moment('21:29', 'HH:mm'), null, '[]')) {
      acc[name].turnos.vespertino += hits;
    } else {
      acc[name].turnos.nocturno += hits;
    }
    return acc;
  }, {});

  console.log("Registros agrupados:", registrosAgrupados);

  const hitsPorEstacion = Object.entries(estaciones).reduce((acc, [nombreEstacion, maquinas]) => {
    acc[nombreEstacion] = 0;
    maquinas.forEach(maquina => {
      const registro = registrosAgrupados[maquina];
      if (registro) {
        acc[nombreEstacion] += registro.hits;
      }
    });
    return acc;
  }, {});

  console.log("Hits por estación:", hitsPorEstacion);

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

  const totalHits = Object.values(registrosAgrupados).reduce((acc, { hits }) => acc + hits, 0);

  const totalHitsPorTurno = Object.values(hitsPorEstacionYTurno).reduce((acc, { matutino, vespertino, nocturno }) => {
    acc.matutino += matutino;
    acc.vespertino += vespertino;
    acc.nocturno += nocturno;
    return acc;
  }, { matutino: 0, vespertino: 0, nocturno: 0 });

  const getClassName = (hits, meta) => {
    return hits >= meta ? 'text-green-600' : 'text-red-600';
  };

  const renderizarTablasPorEstacion = () => {
    const fechaInicio = moment(`${anio}-${mes}-${dia} 06:30`).format('YYYY-MM-DD HH:mm');
    const fechaFin = moment(`${anio}-${mes}-${dia} 06:30`).add(1, 'days').format('YYYY-MM-DD HH:mm');
    
    return Object.entries(estaciones).map(([nombreEstacion, maquinas]) => {
      const registrosEstacion = maquinas.map((maquina) => registrosAgrupados[maquina]).filter(Boolean);
      if (registrosEstacion.length === 0) return null;
      const totalHitsEstacion = registrosEstacion.reduce((total, registro) => total + registro.hits, 0);
      const turnosEstacion = hitsPorEstacionYTurno[nombreEstacion];
      
      // Calculamos la meta por hora para esta estación
      const metaPorHoraEstacion = maquinas.reduce((total, maquina) => total + (metas[maquina] || 0), 0);
      const metasPorTurno = calcularMetasPorTurno(metaPorHoraEstacion);

      // Nuevo: Calcula la suma total de metas
      const totalMetaEstacion = registrosEstacion.reduce((total, registro, index) => {
        const maquina = maquinas[index];
        const metaMaquina = metas[maquina] || 0;
        return total + (metaMaquina * 24);
      }, 0);

      const claseMetaTotal = getClassName(totalHitsEstacion, totalMetaEstacion);

      return (
        <div key={nombreEstacion} className="mb-8">
          <p className="md:hidden text-center mb-2 text-sm text-gray-600">
            Rango de Fecha: {fechaInicio} - {fechaFin}
          </p>
          
          {/* Vista para pantallas grandes */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full bg-white border border-gray-300 shadow-lg rounded-lg table-fixed">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th className="w-1/4 py-2 px-4 border-b text-center font-medium">Nombre</th>
                  <th className="w-1/4 py-2 px-4 border-b text-center font-medium">Rango de Fecha</th>
                  <th className="w-1/4 py-2 px-4 border-b text-center font-medium">Hits</th>
                  <th className="w-1/4 py-2 px-4 border-b text-center font-medium">Meta</th>
                </tr>
              </thead>
              <tbody>
                {registrosEstacion.map((registro, index) => {
                  const maquina = maquinas[index];
                  const metaMaquina = metas[maquina] || 0;
                  const metaJornada = metaMaquina * 24;
                  const claseMeta = getClassName(registro.hits, metaJornada);
                  return (
                    <tr key={index} className="bg-white even:bg-gray-100">
                      <td className="w-1/4 py-2 px-4 border-b text-center">{maquina}</td>
                      <td className="w-1/4 py-2 px-4 border-b text-center">{`${fechaInicio} - ${fechaFin}`}</td>
                      <td className={`w-1/4 py-2 px-4 border-b text-center font-semibold ${claseMeta}`}>{registro.hits}</td>
                      <td className="w-1/4 py-2 px-4 border-b text-center font-semibold">{metaJornada}</td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-200">
                  <td className="py-2 px-4 border-b text-center font-bold text-gray-600" colSpan="2">Total</td>
                  <td className={`py-2 px-4 border-b text-center font-bold ${claseMetaTotal}`}>{totalHitsEstacion}</td>
                  <td className="py-2 px-4 border-b text-center font-bold">{totalMetaEstacion}</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="py-2 px-4 border-b text-center font-bold text-gray-600" colSpan="2">Turnos: </td>
                  <td className="py-2 px-4 border-b text-center" colSpan="2">
                    <div className="flex justify-between">
                      <span>Matutino: <strong className={getClassName(turnosEstacion.matutino, metasPorTurno.matutino)}>{turnosEstacion.matutino}</strong> / Meta: <strong className="text-gray-600">{metasPorTurno.matutino}</strong></span>
                      <span>Vespertino: <strong className={getClassName(turnosEstacion.vespertino, metasPorTurno.vespertino)}>{turnosEstacion.vespertino}</strong> / Meta: <strong className="text-gray-600">{metasPorTurno.vespertino}</strong></span>
                      <span>Nocturno: <strong className={getClassName(turnosEstacion.nocturno, metasPorTurno.nocturno)}>{turnosEstacion.nocturno}</strong> / Meta: <strong className="text-gray-600">{metasPorTurno.nocturno}</strong></span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
         {/* Vista para dispositivos móviles */}
          <div className="md:hidden bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-500 text-white p-3">
              <h3 className="text-lg font-semibold">{nombreEstacion}</h3>
            </div>
            
            <div className="p-4 space-y-4">
              {registrosEstacion.map((registro, index) => {
                const maquina = maquinas[index];
                const metaMaquina = metas[maquina] || 0;
                const metaJornada = metaMaquina * 24;
                const claseMeta = getClassName(registro.hits, metaJornada);
                
                return (
                  <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="font-medium text-gray-700">{maquina}</span>
                    <div className="text-right">
                      <span className="block">
                        <span className={claseMeta}>{registro.hits}</span>
                        <span className="text-gray-600"> / {metaJornada}</span>
                      </span>
                      <span className="text-xs text-gray-500">Hits / Meta</span>
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold text-gray-700">Total Hits / Meta</span>
                <span className="font-bold">
                  <span className={claseMetaTotal}>{totalHitsEstacion}</span>
                  <span className="text-gray-600"> / {totalMetaEstacion}</span>
                </span>
              </div>
          </div>
            
          <div className="bg-green-50 p-4 border-t border-gray-200">
              <h4 className="font-semibold text-green-700 mb-2">Turnos</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="block text-gray-600">Matutino</span>
                  <span className={`font-bold ${getClassName(turnosEstacion.matutino, metasPorTurno.matutino)}`}>{turnosEstacion.matutino}</span>
                  <span className="block text-xs text-gray-500">Meta: {metasPorTurno.matutino}</span>
                </div>
                <div>
                  <span className="block text-gray-600">Vespertino</span>
                  <span className={`font-bold ${getClassName(turnosEstacion.vespertino, metasPorTurno.vespertino)}`}>{turnosEstacion.vespertino}</span>
                  <span className="block text-xs text-gray-500">Meta: {metasPorTurno.vespertino}</span>
                </div>
                <div>
                  <span className="block text-gray-600">Nocturno</span>
                  <span className={`font-bold ${getClassName(turnosEstacion.nocturno, metasPorTurno.nocturno)}`}>{turnosEstacion.nocturno}</span>
                  <span className="block text-xs text-gray-500">Meta: {metasPorTurno.nocturno}</span>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
            <option value="01">Enero</option>
            <option value="02">Febrero</option>
            <option value="03">Marzo</option>
            <option value="04">Abril</option>
            <option value="05">Mayo</option>
            <option value="06">Junio</option>
            <option value="07">Julio</option>
            <option value="08">Agosto</option>
            <option value="09">Septiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 sm:mb-2 text-gray-600">Día</label>
          <select className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg" value={dia} onChange={handleDiaChange}>
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

export default Historial_Por_Dia;