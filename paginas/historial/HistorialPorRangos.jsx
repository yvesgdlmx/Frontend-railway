import { useState, useEffect } from "react";
import clienteAxios from "../../config/clienteAxios";

const estaciones = {
  "Surtido": ["19 LENS LOG"],
  "Bloqueo de tallado": ["220 SRFBLK 1", "221 SRFBLK 2", "222 SRFBLK 3", "223 SRFBLK 4", "224 SRFBLK 5", "225 SRFBLK 6"],
  "Generado": ["241 GENERATOR 1", "242 GENERATOR 2", "245 ORBIT 1 LA", "246 ORBIT 2 LA", "244 ORBIT 3 LA", "243 ORBIT 4 LA", "247 SCHNIDER 1", "248 SCHNIDER 2"],
  "Pulido": ["255 POLISHR 1", "257 POLISHR 3", "259 POLISHR 5", "262 POLISHR 8", "265 POLISHR 12", "266 MULTIFLEX 1", "267 MULTIFLEX 2", "268 MULTIFLEX 3", "269 MULTIFLEX 4", "254 IFLEX SRVR"],
  "Engraver": ["270 ENGRVR 1", "271 ENGRVR 2", "272 ENGRVR 3", "273 ENGRVR 4"],
  "Desbloqueo": ["320 DEBLOCKING 1"],
  "AntiReflejante": ["91 VELOCITY 1", "92 VELOCITY 2", "52 FUSION", "53 1200 D", "55 TLF 1200.1", "56 TLF 1200.2"],
  "Bloqueo de terminado": ["280 FINBLKR 1", "281 FINBLKR 2", "282 FINBLKR 3"],
  "Biselado": ["300 EDGER 1", "301 EDGER 2", "302 EDGER 3", "303 EDGER 4", "304 EDGER 5", "305 EDGER 6", "306 EDGER 7", "307 EDGER 8", "308 EDGER 9", "309 EDGER 10", "310 EDGER 11", "311 EDFGER 12", "299 BISPHERA", "312 RAZR"],
  "Producción": ["32 JOB COMPLETE"],
};

const HistorialPorRangos = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const [anio, setAnio] = useState(yesterday.getFullYear().toString());
  const [mes, setMes] = useState((yesterday.getMonth() + 1).toString().padStart(2, '0'));
  const [diaInicio, setDiaInicio] = useState(yesterday.getDate().toString());
  const [diaFin, setDiaFin] = useState(yesterday.getDate().toString());
  const [registros, setRegistros] = useState([]);

  const handleAnioChange = (e) => {
    setAnio(e.target.value);
  };

  const handleMesChange = (e) => {
    setMes(e.target.value);
  };

  const handleDiaInicioChange = (e) => {
    setDiaInicio(e.target.value);
  };

  const handleDiaFinChange = (e) => {
    setDiaFin(e.target.value);
  };

  useEffect(() => {
    const obtenerRegistros = async () => {
      try {
        const { data } = await clienteAxios(`/historial/historial-3/${anio}/${mes}/${diaInicio}/${diaFin}`);
        console.log("Datos obtenidos de la API:", data);
        setRegistros(data.registros || []);
      } catch (error) {
        console.error("Error al obtener los registros:", error);
        setRegistros([]);
      }
    };

    obtenerRegistros();
  }, [anio, mes, diaInicio, diaFin]);

  // Filtrar registros fuera del rango 06:30 a 23:00
  const registrosFiltrados = registros.filter(({ hour }) => {
    const [hora, minuto] = hour.split(':').map(Number);
    const horaEnMinutos = hora * 60 + minuto;
    return horaEnMinutos >= 390 && horaEnMinutos <= 1380; // 390 es 6:30 AM y 1380 es 11:00 PM
  });
  console.log("Registros filtrados:", registrosFiltrados);

  // Agrupar registros por máquina y sumar hits
  const registrosAgrupados = registrosFiltrados.reduce((acc, registro) => {
    const { name, hits, hour } = registro;
    if (!acc[name]) {
      acc[name] = { hits: 0, turnos: { matutino: 0, vespertino: 0, nocturno: 0 } };
    }
    acc[name].hits += hits;
    // Calcular los hits por turno
    const [hora, minuto] = hour.split(':').map(Number);
    if ((hora > 6 || (hora === 6 && minuto >= 30)) && (hora < 14 || (hora === 14 && minuto < 30))) {
      acc[name].turnos.matutino += hits;
    } else if ((hora > 14 || (hora === 14 && minuto >= 30)) && (hora < 21 || (hora === 21 && minuto < 30))) {
      acc[name].turnos.vespertino += hits;
    } else if ((hora > 19 || (hora === 19 && minuto >= 30)) || (hora < 2 || (hora === 1 && minuto < 30))) {
      acc[name].turnos.nocturno += hits;
    }
    return acc;
  }, {});
  console.log("Registros agrupados:", registrosAgrupados);

  // Calcular el total de hits por estación y turno
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
  console.log("Hits por estación y turno:", hitsPorEstacionYTurno);

  // Calcular el total de hits y hits por turno a nivel general
  const totalHitsPorTurno = Object.values(hitsPorEstacionYTurno).reduce((acc, { matutino, vespertino, nocturno }) => {
    acc.matutino += matutino;
    acc.vespertino += vespertino;
    acc.nocturno += nocturno;
    return acc;
  }, { matutino: 0, vespertino: 0, nocturno: 0 });
  console.log("Total hits por turno:", totalHitsPorTurno);

  // Calcular el total de hits a nivel general
  const totalHits = Object.values(registrosAgrupados).reduce((acc, { hits }) => acc + hits, 0);

  const renderizarTablasPorEstacion = () => {
    return Object.entries(estaciones).map(([nombreEstacion, maquinas]) => {
      const registrosEstacion = maquinas.map((maquina) => registrosAgrupados[maquina]).filter(Boolean);
      if (registrosEstacion.length === 0) return null;
      return (
        <div key={nombreEstacion} className="tabla">
          <table className="a-tabla__table">
            <thead className="a-tabla__thead">
              <tr className="a-tabla__tr-head">
                <th className="a-tabla__th-head" colSpan="3"><strong>{nombreEstacion}</strong></th>
              </tr>
              <tr className="a-tabla__tr-head">
                <th className="a-tabla__th-head">Nombre</th>
                <th className="a-tabla__th-head">Fecha</th>
                <th className="a-tabla__th-head">Hits</th>
              </tr>
            </thead>
            <tbody className="a-tabla__tbody">
              {registrosEstacion.map((registro, index) => {
                const maquina = maquinas[index];
                return (
                  <tr className="a-tabla__tr-body" key={index}>
                    <td className="a-tabla__td-body">{maquina}</td>
                    <td className="a-tabla__td-body">{`${anio}-${mes}-${diaInicio} al ${diaFin}`}</td>
                    <td className="a-tabla__td-body">{registro.hits}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    });
  };

  const renderizarTotalesPorEstacionYTurno = () => {
    return Object.entries(hitsPorEstacionYTurno).map(([nombreEstacion, turnos]) => (
      <div key={nombreEstacion} className="detalles__turno">
        <h3 className="detalles__turno-h3">{nombreEstacion}</h3>
        <div className="detalles__turno-flex">
          <div className="detalles__turno-campo">
            <p className="detalles__turno-p">Turno matutino: <span className="detalles__turno-span">{turnos.matutino}</span></p>
          </div>
          <div className="detalles__turno-campo">
            <p className="detalles__turno-p">Turno vespertino: <span className="detalles__turno-span">{turnos.vespertino}</span></p>
          </div>
          <div className="detalles__turno-campo">
            <p className="detalles__turno-p">Turno nocturno: <span className="detalles__turno-span">{turnos.nocturno}</span></p>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <>
      <h1 className="heading">Historial de Registros</h1>
      <p className="heading__texto">Puedes filtrar tus registros por un rango de fechas y visualizar los trabajos realizados</p>
      <div className='selectores'>
        <div className='selectores__campo'>
          <label className='selectores__label' htmlFor="">Año</label>
          <select className='selectores__select' name="" id="" value={anio} onChange={handleAnioChange}>
            <option className='selectores__option' value="2024">2024</option>
            <option className='selectores__option' value="2023">2023</option>
          </select>
        </div>
        <div className='selectores__campo'>
          <label className='selectores__label' htmlFor="">Mes</label>
          <select className='selectores__select' name="" id="" value={mes} onChange={handleMesChange}>
            <option className='selectores__option' value="01">Enero</option>
            <option className='selectores__option' value="02">Febrero</option>
            <option className='selectores__option' value="03">Marzo</option>
            <option className='selectores__option' value="04">Abril</option>
            <option classame='selectores__option' value="05">Mayo</option>
            <option classame='selectores__option' value="06">Junio</option>
            <option classame='selectores__option' value="07">Julio</option>
            <option classame='selectores__option' value="08">Agosto</option>
            <option classame='selectores__option' value="09">Septiembre</option>
            <option classame='selectores__option' value="10">Octubre</option>
            <option classame='selectores__option' value="11">Noviembre</option>
            <option classame='selectores__option' value="12">Diciembre</option>
          </select>
        </div>
        <div className='selectores__campo'>
          <label className='selectores__label' htmlFor="">Día Inicio</label>
          <select name="" id="" className='selectores__select' value={diaInicio} onChange={handleDiaInicioChange}>
            {[...Array(31).keys()].map((day) => (
              <option className='selectores__option' key={day + 1} value={day + 1}>{day + 1}</option>
            ))}
          </select>
        </div>
        <div className='selectores__campo'>
          <label className='selectores__label' htmlFor="">Día Fin</label>
          <select name="" id="" className='selectores__select' value={diaFin} onChange={handleDiaFinChange}>
            {[...Array(31).keys()].map((day) => (
              <option className='selectores__option' key={day + 1} value={day + 1}>{day + 1}</option>
            ))}
          </select>
        </div>
      </div>
      {renderizarTablasPorEstacion()}
      <div className="tabla__total-contenedor">
        <p className="tabla__total-p">Total: <span className="tabla__total-suma">{totalHits}</span></p>
      </div>
      <div className="turnos__totales">
        {renderizarTotalesPorEstacionYTurno()}
      </div>
      <div className="turnos">
        <p className="turnos__p-2">Total General: </p>
        <div className="turnos__flex">
          <div className="turnos__campo">
            <p className="turnos__p">Turno matutino: <span className="turnos__span">{totalHitsPorTurno.matutino}</span></p>
          </div>
          <div className="turnos__campo">
            <p className="turnos__p">Turno Vespertino: <span className="turnos__span">{totalHitsPorTurno.vespertino}</span></p>
          </div>
          <div className="turnos__campo">
            <p className="turnos__p">Turno Nocturno: <span className="turnos__span">{totalHitsPorTurno.nocturno}</span></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default HistorialPorRangos;