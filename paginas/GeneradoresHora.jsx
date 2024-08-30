import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import clienteAxios from "../config/clienteAxios";
import Navegacion from "../components/Navegacion";

const GeneradoresHora = () => {
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
    "241 GENERATOR 1",
    "242 GENERATOR 2",
    "245 ORBIT 1 LA",
    "246 ORBIT 2 LA",
    "244 ORBIT 3 LA",
    "243 ORBIT 4 LA",
    "247 SCHNIDER 1",
    "248 SCHNIDER 2"
  ];

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const responseMetas = await clienteAxios('/metas/metas-generadores');
        const metas = {};
        if (Array.isArray(responseMetas.data.registros)) {
          responseMetas.data.registros.forEach(meta => {
            metas[meta.name.trim().toUpperCase().replace(/\s+/g, ' ')] = meta.meta;
          });
        } else {
          console.error("La respuesta de las metas no contiene un array válido:", responseMetas.data);
        }
        setMetasPorMaquina(metas);

        const responseRegistros = await clienteAxios('/generadores/generadores/actualdia');
        const dataRegistros = responseRegistros.data.registros || [];
        const registrosFiltrados = dataRegistros.filter(registro => {
          const [hora, minuto] = registro.hour.split(':').map(Number);
          const minutosTotales = hora * 60 + minuto;
          return minutosTotales >= 390 && minutosTotales < 1380; // 06:30 = 390 minutos, 23:00 = 1380 minutos
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

        const horasArray = Array.from(horas).sort().reverse();
        const horasConFormato = horasArray.map(hora => {
          const [horaInicial, minutos, segundos] = hora.split(':');
          const horaFinal = (parseInt(horaInicial, 10) + 1) % 24;
          return `${horaInicial}:${minutos} - ${horaFinal.toString().padStart(2, '0')}:${minutos}`;
        });
        setHorasUnicas(horasConFormato);
        setTotalesAcumulados(acumulados);
        calcularTotalesPorTurno(registrosFiltrados);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };
    cargarDatos();
  }, []);

  const calcularTotalesPorTurno = (registros) => {
    const totales = {
      matutino: 0,
      vespertino: 0,
      nocturno: 0
    };
    registros.forEach(registro => {
      const [hora, minuto] = registro.hour.split(':').map(Number);
      const minutosTotales = hora * 60 + minuto;
      if (minutosTotales >= 390 && minutosTotales < 870) { // 06:30 - 14:30
        totales.matutino += registro.hits;
      } else if (minutosTotales >= 870 && minutosTotales < 1170) { // 14:30 - 19:30
        totales.vespertino += registro.hits;
      } else if (minutosTotales >= 1170 && minutosTotales < 1380) { // 19:30 - 23:00
        totales.nocturno += registro.hits;
      }
    });
    setTotalesPorTurno(totales);
  };

  const calcularHorasTranscurridasDesde = (horaInicio) => {
    const ahora = new Date();
    const inicio = new Date();
    inicio.setHours(horaInicio, 30, 0, 0);
    const diferenciaMilisegundos = ahora - inicio;
    const diferenciaHoras = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60)); // Convertir milisegundos a horas completas
    return diferenciaHoras;
  };

  const sumaTotalAcumulados = Object.values(totalesAcumulados).reduce((acc, curr) => acc + curr, 0);

  const metaAcumuladaTotal = Object.keys(metasPorMaquina).reduce((acc, celula) => {
    const meta = metasPorMaquina[celula] || 0;
    return acc + (meta * horasUnicas.length);
  }, 0);

  const sumaTotalMetas = Object.keys(metasPorMaquina).reduce((acc, celula) => {
    return acc + (metasPorMaquina[celula] || 0);
  }, 0);

  const sumaHitsPorHora = horasUnicas.map(hora => {
    const horaSinFormato = hora.split(' - ')[0];
    return Object.values(registrosAgrupados).flat().filter(r => r.hour.startsWith(horaSinFormato))
      .reduce((acc, curr) => acc + parseInt(curr.hits || 0), 0);
  });

  const metaPorHora = sumaTotalMetas;

  const claseSumaTotalAcumulados = sumaTotalAcumulados >= metaAcumuladaTotal ? "generadores__check" : "generadores__uncheck";

  const horasTranscurridasMatutino = calcularHorasTranscurridasDesde(6);
  const metaAcumuladaMatutino = sumaTotalMetas * (horasTranscurridasMatutino > 0 ? horasTranscurridasMatutino : 1);
  const claseTotalMatutino = (totalesPorTurno.matutino >= metaAcumuladaMatutino && totalesPorTurno.matutino > 0) ? "generadores__check" : "generadores__uncheck";

  const horasTranscurridasVespertino = calcularHorasTranscurridasDesde(14);
  const metaAcumuladaVespertino = sumaTotalMetas * (horasTranscurridasVespertino > 0 ? horasTranscurridasVespertino : 1);
  const claseTotalVespertino = (totalesPorTurno.vespertino >= metaAcumuladaVespertino && totalesPorTurno.vespertino > 0) ? "generadores__check" : "generadores__uncheck";

  const horasTranscurridasNocturno = calcularHorasTranscurridasDesde(19);
  const metaAcumuladaNocturno = sumaTotalMetas * (horasTranscurridasNocturno > 0 ? horasTranscurridasNocturno : 1);
  const claseTotalNocturno = (totalesPorTurno.nocturno >= metaAcumuladaNocturno && totalesPorTurno.nocturno > 0) ? "generadores__check" : "generadores__uncheck";

  return (
    <>
      <div className="boton__link">
        <Link to={"/procesos-horas"}>
          <button className="boton__regresar">
            <img src="/back.png" alt="" className="boton__regresar-img" />
            Volver
          </button>
        </Link>
      </div>
      <Navegacion/>
      <h1 className="heading2">Generadores</h1>
      <div>
        <table className="a-tabla__table">
          <thead className="a-tabla__thead">
            <tr className="a-tabla__tr-head">
              <th className="a-tabla__th-head">Nombre</th>
              <th className="a-tabla__th-head">Total Acumulado</th>
              <th className="a-tabla__th-head">Meta</th>
              {horasUnicas.map((hora, index) => (
                <th key={index} className="a-tabla__th-head">{hora}</th>
              ))}
            </tr>
          </thead>
          <tbody className="a-tabla__tbody">
            {ordenCelulas.map((celula, index) => {
              const registrosCelula = registrosAgrupados[celula] || [];
              const totalAcumulado = totalesAcumulados[celula] || 0;
              const meta = metasPorMaquina[celula] || 0;
              const metaAcumulada = meta * horasUnicas.length;
              const claseTotalAcumulado = totalAcumulado >= metaAcumulada ? "generadores__check" : "generadores__uncheck";
              return (
                <tr key={index} className="a-tabla__tr-body">
                  <td className="a-tabla__td-body">{celula}</td>
                  <td className={`a-tabla__td-body ${claseTotalAcumulado}`}>{totalAcumulado}</td>
                  <td className="a-tabla__td-body">{meta || 'No definida'}</td>
                  {horasUnicas.map((hora, idx) => {
                    const horaSinFormato = hora.split(' - ')[0];
                    const totalHits = registrosCelula.filter(r => r.hour.startsWith(horaSinFormato))
                      .reduce((acc, curr) => acc + parseInt(curr.hits || 0), 0);
                    return (
                      <td key={idx} className={totalHits >= meta ? "a-tabla__td-body generadores__check" : "a-tabla__td-body generadores__uncheck"}>
                        {totalHits}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr className="a-tabla__tr-body">
              <td className="a-tabla__td-body">Totales</td>
              <td className={`a-tabla__td-body fw ${claseSumaTotalAcumulados}`}>{sumaTotalAcumulados}</td>
              <td className="a-tabla__td-body fw">{sumaTotalMetas}</td>
              {sumaHitsPorHora.map((sumaHits, index) => {
                const claseSumaHits = sumaHits >= metaPorHora ? "generadores__check" : "generadores__uncheck";
                return (
                  <td key={index} className={`a-tabla__td-body fw ${claseSumaHits}`}>{sumaHits}</td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      <div className='tabla__div'>
        <div className='tabla__campo position-rela-2'>
          <p className='tabla__p'>Total Matutino: <span className={`tabla__span ${claseTotalMatutino}`}>{totalesPorTurno.matutino}</span></p>
        </div>
        <div className='tabla__campo position-rela-2'>
          <p className='tabla__p'>Total Vespertino: <span className={`tabla__span ${claseTotalVespertino}`}>{totalesPorTurno.vespertino}</span></p>
        </div>
        <div className='tabla__campo position-rela-2'>
          <p className='tabla__p'>Total Nocturno: <span className={`tabla__span ${claseTotalNocturno}`}>{totalesPorTurno.nocturno}</span></p>
        </div>
      </div>
    </>
  );
};

export default GeneradoresHora;