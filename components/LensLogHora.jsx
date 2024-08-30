import { useEffect, useState } from "react";
import clienteAxios from "../config/clienteAxios";
import { Link, useLocation } from "react-router-dom";
import formatearHora from "../helpers/formatearHora";

const LensLogHora = () => {
    const [registros, setRegistros] = useState([]);
    const [meta, setMeta] = useState(0);
    const [totalesPorTurno, setTotalesPorTurno] = useState({
        matutino: 0,
        vespertino: 0,
        nocturno: 0
    });
    const location = useLocation();

    useEffect(() => {
        const obtenerMeta = async () => {
            const { data } = await clienteAxios(`/metas/metas-manuales`);
            const metaLensLog = data.registros.find(registro => registro.name === '19 LENS LOG');
            if (metaLensLog) {
                setMeta(metaLensLog.meta);
            }
        };
        obtenerMeta();
    }, []);

    useEffect(() => {
        const obtenerRegistros = async () => {
            const { data } = await clienteAxios(`/manual/manual/actualdia`);
            const registrosLensLog = data.registros.filter(registro => registro.name.includes('LENS LOG'));
            // Filtrar los registros que están entre las 06:30 y las 23:00
            const registrosFiltrados = registrosLensLog.filter(registro => {
                const [hora, minuto] = registro.hour.split(':').map(Number);
                const minutosTotales = hora * 60 + minuto;
                return minutosTotales >= 390 && minutosTotales < 1380; // 06:30 = 390 minutos, 23:00 = 1380 minutos
            });
            setRegistros(registrosFiltrados);
            calcularTotalesPorTurno(registrosFiltrados);
        };
        obtenerRegistros();
    }, []);

    useEffect(() => {
        if (location.hash) {
            const element = document.getElementById(location.hash.substring(1));
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [location]);

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
            } else if (minutosTotales >= 870 && minutosTotales < 1170) { // 14:30 - 19:30
                totales.vespertino += registro.hits;
            } else if (minutosTotales >= 1170 && minutosTotales < 1380) { // 19:30 - 23:00
                totales.nocturno += registro.hits;
            }
        });
        setTotalesPorTurno(totales);
    };

    const calcularHorasTranscurridas = (horaInicio, horaFin) => {
        const [horaInicioH, horaInicioM] = horaInicio.split(':').map(Number);
        const [horaFinH, horaFinM] = horaFin.split(':').map(Number);
        const minutosInicio = horaInicioH * 60 + horaInicioM;
        const minutosFin = horaFinH * 60 + horaFinM;
        return Math.ceil((minutosFin - minutosInicio) / 60);
    };

    const obtenerHoraActual = () => {
        const ahora = new Date();
        const horas = String(ahora.getHours()).padStart(2, '0');
        const minutos = String(ahora.getMinutes()).padStart(2, '0');
        return `${horas}:${minutos}`;
    };

    const calcularMetaPorHorasTranscurridas = (horaInicio, horaFin, metaPorHora) => {
        const horasTranscurridas = calcularHorasTranscurridas(horaInicio, horaFin);
        console.log(`Meta: ${metaPorHora}, Horas Transcurridas: ${horasTranscurridas}`);
        return horasTranscurridas * metaPorHora;
    };

    const hitsPorHora = agruparHitsPorHora();
    const horasOrdenadas = Object.keys(hitsPorHora).sort().reverse();
    const filaGenerados = horasOrdenadas.map((hora) => hitsPorHora[hora]);
    const formatearHoraSinSegundos = (hora) => {
        return hora.slice(0, 5); // Esto eliminará los segundos de la hora
    };

    const calcularRangoHoras = (horaInicio) => {
        const horaInicioFormateada = formatearHoraSinSegundos(horaInicio);
        const horaFin = new Date(new Date(`2000-01-01 ${horaInicio}`).getTime() + 60 * 60 * 1000).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'});
        return `${horaInicioFormateada} - ${horaFin}`;
    };

    const getClassName = (hits, meta) => {
        if (hits === 0) {
            return "procesos-2__span-negro";
        }
        return hits >= meta ? "procesos-2__span-verde" : "procesos-2__span-rojo";
    };

    const horaActual = obtenerHoraActual();

    // Calcular metas ajustadas para cada turno
    const metaMatutinoAjustada = calcularMetaPorHorasTranscurridas("06:30", horaActual, meta);
    const metaVespertinoAjustada = calcularMetaPorHorasTranscurridas("14:30", horaActual, meta);
    const metaNocturnoAjustada = calcularMetaPorHorasTranscurridas("19:30", horaActual, meta);

    // Ajustar las metas para que cuenten al menos una hora al inicio de cada turno
    const ajustarMetaPorTurno = (horaInicio, horaActual, metaPorHora) => {
        const horasTranscurridas = Math.max(1, calcularHorasTranscurridas(horaInicio, horaActual));
        return horasTranscurridas * metaPorHora;
    };

    const metaMatutinoFinal = ajustarMetaPorTurno("06:30", horaActual, meta);
    const metaVespertinoFinal = ajustarMetaPorTurno("14:30", horaActual, meta);
    const metaNocturnoFinal = ajustarMetaPorTurno("19:30", horaActual, meta);

    return (
        <>
            <div className="generado-hora" id="lenslog">
                <table className="tabla">
                    <thead className="tabla__thead">
                        <tr className="tabla__tr">
                            <th className="tabla__th"></th>
                            {horasOrdenadas.map((hora) => (
                                <th key={hora} className="tabla__th">{calcularRangoHoras(formatearHoraSinSegundos(hora))}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="tabla__tr">
                            <Link to={'/lenslog-horas'} className="link__tabla">
                                <div className="tabla__th-flex">
                                    <img src="./img/ver.png" alt="imagen-ver" className="tabla__ver" />
                                    <td className="tabla__td position">Surtido <br/> <span className="tabla__td-span">Meta: <span className="tabla__span-meta">{meta}</span></span></td>
                                </div>
                            </Link>
                            {filaGenerados.map((generado, index) => (
                                <td key={index} className={metaMatutinoFinal > generado ? `tabla__td generadores__uncheck` : `tabla__td generadores__check`}>{generado}</td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className='tabla__div'>
                <div className='tabla__campo'>
                    <p className='tabla__p'>Total Matutino: <span className={getClassName(totalesPorTurno.matutino, metaMatutinoFinal)}>{totalesPorTurno.matutino}</span></p>
                </div>
                <div className='tabla__campo'>
                    <p className='tabla__p'>Total Vespertino: <span className={getClassName(totalesPorTurno.vespertino, metaVespertinoFinal)}>{totalesPorTurno.vespertino}</span></p>
                </div>
                <div className='tabla__campo'>
                    <p className='tabla__p'>Total Nocturno: <span className={getClassName(totalesPorTurno.nocturno, metaNocturnoFinal)}>{totalesPorTurno.nocturno}</span></p>
                </div>
            </div>
        </>
    );
};

export default LensLogHora;