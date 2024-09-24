import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import clienteAxios from "../config/clienteAxios";
import Navegacion from "../components/Navegacion";

const ARHoras = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 300000); // Actualiza cada 5 minutos
    return () => clearInterval(interval);
  }, []);

  const [registros, setRegistros] = useState([]);
  const [horasUnicas, setHorasUnicas] = useState([]);
  const [totalesAcumulados, setTotalesAcumulados] = useState(0);
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
        const registrosFiltrados = dataRegistros.filter(registro => {
          const [hora, minuto] = registro.hour.split(':').map(Number);
          const minutosTotales = hora * 60 + minuto;
          return minutosTotales >= 390 && minutosTotales < 1380 && 
            ['91', '92', '52', '53', '54', '55', '56'].some(num => registro.name.includes(num));
        });

        const horas = new Set();
        let totalAcumulado = 0;
        registrosFiltrados.forEach(registro => {
          horas.add(registro.hour);
          totalAcumulado += parseInt(registro.hits || 0);
        });

        const horasArray = Array.from(horas).sort().reverse();
        const horasConFormato = horasArray.map(hora => {
          const [horaInicial, minutos] = hora.split(':');
          const horaFinal = (parseInt(horaInicial, 10) + 1) % 24;
          return `${horaInicial}:${minutos} - ${horaFinal.toString().padStart(2, '0')}:${minutos}`;
        });

        setHorasUnicas(horasConFormato);
        setTotalesAcumulados(totalAcumulado);
        setRegistros(registrosFiltrados);
        calcularTotalesPorTurno(registrosFiltrados);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };
    cargarDatos();
  }, []);

  const agruparHitsPorHora = () => {
    const hitsPorHora = {};
    registros.forEach((registro) => {
      const hora = registro.hour;
      if (hitsPorHora[hora]) {
        hitsPorHora[hora] += registro.hits;
      } else {
        hitsPorHora[hora] = registro.hits;
      }
    });
    return hitsPorHora;
  };

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
      } else if (minutosTotales >= 870 && minutosTotales < 1290) { // 14:30 - 21:30
        totales.vespertino += registro.hits;
      } else if (minutosTotales >= 1290 || minutosTotales < 390) { // 21:30 - 06:30
        totales.nocturno += registro.hits;
      }
    });
    setTotalesPorTurno(totales);
  };

  const sumaHitsPorHora = horasUnicas.map(hora => {
    const horaSinFormato = hora.split(' - ')[0];
    return registros.filter(r => r.hour.startsWith(horaSinFormato))
      .reduce((acc, curr) => acc + parseInt(curr.hits || 0), 0);
  });

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
      <Navegacion />
      <h1 className="heading2">Anti Reflejante</h1>
      <div>
        <table className="a-tabla__table">
          <thead className="a-tabla__thead">
            <tr className="a-tabla__tr-head">
              <th className="a-tabla__th-head">Nombre</th>
              <th className="a-tabla__th-head">Total Acumulado</th>
              {horasUnicas.map((hora, index) => (
                <th key={index} className="a-tabla__th-head">{hora}</th>
              ))}
            </tr>
          </thead>
          <tbody className="a-tabla__tbody">
            <tr className="a-tabla__tr-body">
              <td className="a-tabla__td-body">AR</td>
              <td className="a-tabla__td-body">{totalesAcumulados}</td>
              {horasUnicas.map((hora, idx) => {
                const horaSinFormato = hora.split(' - ')[0];
                const totalHits = registros.filter(r => r.hour.startsWith(horaSinFormato))
                  .reduce((acc, curr) => acc + parseInt(curr.hits || 0), 0);
                return (
                  <td key={idx} className="a-tabla__td-body">
                    {totalHits}
                  </td>
                );
              })}
            </tr>
            <tr className="a-tabla__tr-body">
              <td className="a-tabla__td-body">Totales</td>
              <td className="a-tabla__td-body fw">{totalesAcumulados}</td>
              {sumaHitsPorHora.map((sumaHits, index) => (
                <td key={index} className="a-tabla__td-body fw">{sumaHits}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className='tabla__div'>
        <div className='tabla__campo position-rela-2'>
          <p className='tabla__p'>Total Matutino: <span className="tabla__span">{totalesPorTurno.matutino}</span></p>
        </div>
        <div className='tabla__campo position-rela-2'>
          <p className='tabla__p'>Total Vespertino: <span className="tabla__span">{totalesPorTurno.vespertino}</span></p>
        </div>
        <div className='tabla__campo position-rela-2'>
          <p className='tabla__p'>Total Nocturno: <span className="tabla__span">{totalesPorTurno.nocturno}</span></p>
        </div>
      </div>
    </>
  );
};

export default ARHoras;