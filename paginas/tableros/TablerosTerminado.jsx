import { useState, useEffect } from "react";
import clienteAxios from "../../config/clienteAxios";

const TablerosTerminado = () => {
  const [paginaActual, setPaginaActual] = useState(0);
  const [enPantallaCompleta, setEnPantallaCompleta] = useState(false);
  const [registros, setRegistros] = useState([]);
  const [horasUnicas, setHorasUnicas] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [metasPorMaquina, setMetasPorMaquina] = useState({});
  const [totalesAcumulados, setTotalesAcumulados] = useState({});
  const [registros1, setRegistros1] = useState([]);
  const [horasUnicas1, setHorasUnicas1] = useState([]);
  const [maquinas1, setMaquinas1] = useState([]);
  const [metasPorMaquina1, setMetasPorMaquina1] = useState({});
  const [totalesAcumulados1, setTotalesAcumulados1] = useState({});
  const [tiempoRestante, setTiempoRestante] = useState(10); // Estado para el temporizador

  const cargarDatosTerminados = async () => {
    try {
      const responseMetas = await clienteAxios('/metas/metas-terminados');
      const metas = {};
      let metaAcumulada = 0;
      if (Array.isArray(responseMetas.data.registros)) {
        responseMetas.data.registros.forEach(meta => {
          const nombreMaquina = meta.name.trim().toUpperCase().replace(/\s+/g, ' ');
          metas[nombreMaquina] = meta.meta;
          metaAcumulada += meta.meta;
        });
      } else {
        console.error("La respuesta de las metas no contiene un array válido:", responseMetas.data);
      }
      setMetasPorMaquina(metas);

      const responseRegistros = await clienteAxios('/terminado/terminado/actualdia');
      const dataRegistros = responseRegistros.data.registros || [];
      const registrosFiltrados = dataRegistros.filter(registro => {
        const hora = parseInt(registro.hour.split(":")[0], 10);
        return (hora > 5 && hora < 23);
      });
      setRegistros(registrosFiltrados);

      const horas = new Set();
      const maquinasUnicas = new Set();
      const acumulados = {};
      registrosFiltrados.forEach(registro => {
        horas.add(registro.hour);
        const maquina = registro.name.split("-")[0].trim().toUpperCase().replace(/\s+/g, ' ');
        maquinasUnicas.add(maquina);
        acumulados[maquina] = (acumulados[maquina] || 0) + parseInt(registro.hits || 0);
      });

      const horasArray = Array.from(horas).sort().reverse();
      const horasConFormato = horasArray.map(hora => {
        const [horaInicial, minutos, segundos] = hora.split(':');
        const horaFinal = (parseInt(horaInicial, 10) + 1) % 24;
        return `${horaInicial}:${minutos} - ${horaFinal.toString().padStart(2, '0')}:${minutos}`;
      });

      setHorasUnicas(horasConFormato);
      setMaquinas(Array.from(maquinasUnicas));
      setTotalesAcumulados(acumulados);
    } catch (error) {
      console.error("Error al cargar los datos:", error);
    }
  };

  const cargarDatosBiselados = async () => {
    try {
      const responseMetas = await clienteAxios('/metas/metas-biselados');
      const metas = {};
      let metaAcumulada = 0;
      if (Array.isArray(responseMetas.data.registros)) {
        responseMetas.data.registros.forEach(meta => {
          const nombreMaquina = meta.name.trim().toUpperCase().replace(/\s+/g, ' ');
          metas[nombreMaquina] = meta.meta;
          metaAcumulada += meta.meta;
        });
      } else {
        console.error("La respuesta de las metas no contiene un array válido:", responseMetas.data);
      }
      setMetasPorMaquina1(metas);

      const responseRegistros = await clienteAxios('/biselado/biselado/actualdia');
      const dataRegistros = responseRegistros.data.registros || [];
      const registrosFiltrados = dataRegistros.filter(registro => {
        const hora = parseInt(registro.hour.split(":")[0], 10);
        return (hora > 5 && hora < 23);
      });
      setRegistros1(registrosFiltrados);

      const horas = new Set();
      const maquinasUnicas = new Set();
      const acumulados = {};
      registrosFiltrados.forEach(registro => {
        horas.add(registro.hour);
        const maquina = registro.name.split("-")[0].trim().toUpperCase().replace(/\s+/g, ' ');
        maquinasUnicas.add(maquina);
        acumulados[maquina] = (acumulados[maquina] || 0) + parseInt(registro.hits || 0);
      });

      const horasArray = Array.from(horas).sort().reverse();
      const horasConFormato = horasArray.map(hora => {
        const [horaInicial, minutos, segundos] = hora.split(':');
        const horaFinal = (parseInt(horaInicial, 10) + 1) % 24;
        return `${horaInicial}:${minutos} - ${horaFinal.toString().padStart(2, '0')}:${minutos}`;
      });

      setHorasUnicas1(horasConFormato);
      setMaquinas1(Array.from(maquinasUnicas));
      setTotalesAcumulados1(acumulados);
    } catch (error) {
      console.error("Error al cargar los datos:", error);
    }
  };

  useEffect(() => {
    cargarDatosTerminados();
    cargarDatosBiselados();
  }, []);

  // Calcular la suma total de los totales acumulados
  const sumaTotalAcumulados = Object.values(totalesAcumulados).reduce((acc, curr) => acc + curr, 0);
  const sumaTotalAcumulados1 = Object.values(totalesAcumulados1).reduce((acc, curr) => acc + curr, 0);

  // Calcular la meta acumulada total en función de las horas transcurridas
  const horasTranscurridas = horasUnicas.length;
  const horasTranscurridas1 = horasUnicas1.length;
  
  const metaAcumuladaTotal = maquinas.reduce((acc, maquina) => {
    const meta = metasPorMaquina[maquina] || 0;
    return acc + (meta * horasTranscurridas);
  }, 0);
  const metaAcumuladaTotal1 = maquinas1.reduce((acc, maquina) => {
    const meta = metasPorMaquina1[maquina] || 0;
    return acc + (meta * horasTranscurridas1);
  }, 0);

  // Calcular la suma total de las metas
  const sumaTotalMetas = maquinas.reduce((acc, maquina) => {
    return acc + (metasPorMaquina[maquina] || 0);
  }, 0);
  const sumaTotalMetas1 = maquinas1.reduce((acc, maquina) => {
    return acc + (metasPorMaquina1[maquina] || 0);
  }, 0);

  // Calcular la suma total de hits por hora
  const sumaHitsPorHora = horasUnicas.map(hora => {
    const horaSinFormato = hora.split(' - ')[0];
    return registros.filter(r => r.hour.startsWith(horaSinFormato))
      .reduce((acc, curr) => acc + parseInt(curr.hits || 0), 0);
  });
  const sumaHitsPorHora1 = horasUnicas1.map(hora => {
    const horaSinFormato = hora.split(' - ')[0];
    return registros1.filter(r => r.hour.startsWith(horaSinFormato))
      .reduce((acc, curr) => acc + parseInt(curr.hits || 0), 0);
  });

  // Calcular la meta por hora
  const metaPorHora = sumaTotalMetas;
  const metaPorHora1 = sumaTotalMetas1;

  // Determinar la clase para la suma total acumulada
  const claseSumaTotalAcumulados = sumaTotalAcumulados >= metaAcumuladaTotal ? "generadores__check" : "generadores__uncheck";
  const claseSumaTotalAcumulados1 = sumaTotalAcumulados1 >= metaAcumuladaTotal1 ? "generadores__check" : "generadores__uncheck";

  const tablas = [
    (
      <div key="tabla1" className='b-tabla__contenedor'>
        <table className="b-tabla__table">
          <thead className="b-tabla__thead">
            <tr className="b-tabla__tr-head">
              <th className="b-tabla__th-head text-align-left" colSpan="15"><p className="position-rela">Bloqueo de terminado</p></th>
            </tr>
            <tr className="b-tabla__tr-head">
              <th className="b-tabla__th-head">Nombre</th>
              <th className="b-tabla__th-head">Total Acumulado</th>
              <th className="b-tabla__th-head">Meta</th>
              {horasUnicas.map((hora, index) => (
                <th key={index} className="b-tabla__th-head">{hora}</th>
              ))}
            </tr>
          </thead>
          <tbody className="b-tabla__tbody">
            {maquinas.map((maquina, index) => {
              const totalAcumulado = totalesAcumulados[maquina] || 0;
              const meta = metasPorMaquina[maquina] || 0;
              const metaAcumulada = meta * horasUnicas.length;
              const claseTotalAcumulado = totalAcumulado >= metaAcumulada ? "generadores__check" : "generadores__uncheck";
              return (
                <tr key={index} className="b-tabla__tr-body">
                  <td className="b-tabla__td-body">{maquina}</td>
                  <td className={`b-tabla__td-body ${claseTotalAcumulado}`}>{totalAcumulado}</td>
                  <td className="b-tabla__td-body">{meta || 'No definida'}</td>
                  {horasUnicas.map((hora, idx) => {
                    const horaSinFormato = hora.split(' - ')[0];
                    const totalHits = registros.filter(r => r.name.startsWith(maquina) && r.hour.startsWith(horaSinFormato))
                      .reduce((acc, curr) => acc + parseInt(curr.hits || 0), 0);
                    return (
                      <td key={idx} className={totalHits >= meta ? "b-tabla__td-body generadores__check" : "b-tabla__td-body generadores__uncheck"}>
                        {totalHits}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr className="b-tabla__tr-body">
              <td className="b-tabla__td-body">Totales</td>
              <td className={`b-tabla__td-body ${claseSumaTotalAcumulados}`}>{sumaTotalAcumulados}</td>
              <td className="b-tabla__td-body fw">{sumaTotalMetas}</td>
              {sumaHitsPorHora.map((sumaHits, index) => {
                const claseSumaHits = sumaHits >= metaPorHora ? "generadores__check" : "generadores__uncheck";
                return (
                  <td key={index} className={`b-tabla__td-body fw ${claseSumaHits}`}>{sumaHits}</td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    ),
    (
      <div key="tabla2" className='a-tabla__contenedor'>
        <table className="b-tabla__table">
          <thead className="b-tabla__thead">
            <tr className="b-tabla__tr-head">
              <th className="b-tabla__th-head text-align-left" colSpan="15"><p className="position-rela">Biselado</p></th>
            </tr>
            <tr className="b-tabla__tr-head">
              <th className="b-tabla__th-head">Nombre</th>
              <th className="b-tabla__th-head">Total Acumulado</th>
              <th className="b-tabla__th-head">Meta</th>
              {horasUnicas1.map((hora, index) => (
                <th key={index} className="b-tabla__th-head">{hora}</th>
              ))}
            </tr>
          </thead>
          <tbody className="b-tabla__tbody">
            {maquinas1.map((maquina, index) => {
              const totalAcumulado = totalesAcumulados1[maquina] || 0;
              const meta = metasPorMaquina1[maquina] || 0;
              const metaAcumulada = meta * horasUnicas1.length;
              const claseTotalAcumulado = totalAcumulado >= metaAcumulada ? "generadores__check" : "generadores__uncheck";
              return (
                <tr key={index} className="b-tabla__tr-body">
                  <td className="b-tabla__td-body">{maquina}</td>
                  <td className={`b-tabla__td-body ${claseTotalAcumulado}`}>{totalAcumulado}</td>
                  <td className="b-tabla__td-body">{meta || 'No definida'}</td>
                  {horasUnicas1.map((hora, idx) => {
                    const horaSinFormato = hora.split(' - ')[0];
                    const totalHits = registros1.filter(r => r.name.startsWith(maquina) && r.hour.startsWith(horaSinFormato))
                      .reduce((acc, curr) => acc + parseInt(curr.hits || 0), 0);
                    return (
                      <td key={idx} className={totalHits >= meta ? "b-tabla__td-body generadores__check" : "b-tabla__td-body generadores__uncheck"}>
                        {totalHits}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr className="b-tabla__tr-body">
              <td className="b-tabla__td-body">Totales</td>
              <td className={`b-tabla__td-body ${claseSumaTotalAcumulados1}`}>{sumaTotalAcumulados1}</td>
              <td className="b-tabla__td-body fw">{sumaTotalMetas1}</td>
              {sumaHitsPorHora1.map((sumaHits, index) => {
                const claseSumaHits = sumaHits >= metaPorHora1 ? "generadores__check" : "generadores__uncheck";
                return (
                  <td key={index} className={`b-tabla__td-body fw ${claseSumaHits}`}>{sumaHits}</td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    ),
  ];

  const handleAnterior = () => {
    setPaginaActual((prevPagina) => (prevPagina > 0 ? prevPagina - 1 : tablas.length - 1));
  };

  const handleSiguiente = () => {
    setPaginaActual((prevPagina) => (prevPagina < tablas.length - 1 ? prevPagina + 1 : 0));
    setTiempoRestante(30); // Reinicia el temporizador
  };

  const handleFullScreen = () => {
    const elem = document.getElementById('fullscreen-table-container');
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { // Firefox
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { // Chrome, Safari and Opera
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // IE/Edge
      elem.msRequestFullscreen();
    }
    setEnPantallaCompleta(true);
    setPaginaActual(0); // Reinicia a la primera tabla
    setTiempoRestante(30); // Inicia el temporizador
    setTimeout(() => {
      const tableContainer = document.querySelector('.a-tabla__contenedor');
      if (tableContainer) {
        tableContainer.scrollLeft = 0; // Desplaza a la primera columna
      }
    }, 1000); // Espera un momento para asegurar que el modo completo se haya activado
  };

  useEffect(() => {
    let interval;
    if (enPantallaCompleta) {
      interval = setInterval(() => {
        setTiempoRestante((prevTiempo) => {
          if (prevTiempo === 1) {
            handleSiguiente(); // Cambia de tabla cuando el temporizador llega a 0
            cargarDatosTerminados(); // Llama a la función para actualizar los datos
            cargarDatosBiselados(); // Llama a la función para actualizar los datos
            return 10; // Reinicia el temporizador
          }
          return prevTiempo - 1;
        });
      }, 1000); // Actualiza cada segundo
    }
    return () => clearInterval(interval);
  }, [enPantallaCompleta]);

  return (
    <>
      <h1 className="heading">Tableros de áreas</h1>
      <p className="heading__texto">Mostrando información del área de terminado</p>
      <div className="paginador__acciones">
        <button className="paginador__pantalla-completa" onClick={handleFullScreen}>Pantalla Completa</button>
      </div>
      <div id="fullscreen-table-container" className='a-tabla'>
        {tablas[paginaActual]}
        {enPantallaCompleta && (
          <div className="temporizador">
            Cambio en: {tiempoRestante} segundos
          </div>
        )}
      </div>
      <div className="paginador">
        <button className="paginador__back" onClick={handleAnterior}>Anterior</button>
        <button className="paginador__next" onClick={handleSiguiente}>Siguiente</button>
      </div>
    </>
  );
}

export default TablerosTerminado