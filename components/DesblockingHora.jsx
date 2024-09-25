import { useEffect, useState } from "react";
import clienteAxios from "../config/clienteAxios";
import { Link, useLocation } from "react-router-dom";

const DesblockingHora = () => {
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
            try {
                const { data } = await clienteAxios(`/metas/metas-manuales`);
                const metasDesblocking = data.registros.filter(meta => meta.name.includes('320 DEBLOCKING 1'));
                const sumaMetas = metasDesblocking.reduce((acc, meta) => acc + meta.meta, 0);
                setMeta(sumaMetas);
                console.log('Meta obtenida:', sumaMetas);
            } catch (error) {
                console.error('Error al obtener la meta:', error);
            }
        };
        obtenerMeta();
    }, []);

    useEffect(() => {
        const obtenerRegistros = async () => {
            try {
                const { data } = await clienteAxios(`/manual/manual/actualdia`);
                const registrosDesblocking = data.registros.filter(registro => registro.name.includes('DEBLOCKING'));
                const registrosFiltrados = registrosDesblocking.filter(registro => {
                    const [hora, minuto] = registro.hour.split(':').map(Number);
                    const minutosTotales = hora * 60 + minuto;
                    return minutosTotales >= 390 && minutosTotales < 1380;
                });
                setRegistros(registrosFiltrados);
                calcularTotalesPorTurno(registrosFiltrados);
            } catch (error) {
                console.error('Error al obtener los registros:', error);
            }
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
            if (minutosTotales >= 390 && minutosTotales < 870) {
                totales.matutino += registro.hits;
            }
            if (minutosTotales >= 870 && minutosTotales < 1290) {
                totales.vespertino += registro.hits;
            }
            if (minutosTotales >= 1290 || minutosTotales < 390) {
                totales.nocturno += registro.hits;
            }
        });
        setTotalesPorTurno(totales);
    };

    const calcularMetaPorTurno = (horasTurno) => {
        return meta * horasTurno;
    };

    const hitsPorHora = agruparHitsPorHora();
    const horasOrdenadas = Object.keys(hitsPorHora).sort().reverse();

    const formatearHoraSinSegundos = (hora) => {
        return hora.slice(0, 5);
    };

    const calcularRangoHoras = (horaInicio) => {
        const horaInicioFormateada = formatearHoraSinSegundos(horaInicio);
        const horaFin = new Date(new Date(`2000-01-01 ${horaInicio}`).getTime() + 60 * 60 * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        return `${horaInicioFormateada} - ${horaFin}`;
    };

    const getClassName = (hits, meta) => {
        if (hits === 0) {
            return "procesos-2__span-negro";
        }
        return hits >= meta ? "procesos-2__span-verde" : "procesos-2__span-rojo";
    };

    const metaMatutinoFinal = calcularMetaPorTurno(8);
    const metaVespertinoFinal = calcularMetaPorTurno(7);
    const metaNocturnoFinal = calcularMetaPorTurno(4);

    return (
        <>
            <div className="generado-hora" id="desbloqueo">
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
                            <Link to={'/desblocking-horas'} className="link__tabla">
                                <div className="tabla__th-flex">
                                    <img src="./img/ver.png" alt="imagen-ver" className="tabla__ver" />
                                    <td className="tabla__td position">Desbloqueo <br /> <span className="tabla__td-span">Meta: <span className="tabla__span-meta">{meta}</span></span></td>
                                </div>
                            </Link>
                            {horasOrdenadas.map((hora, index) => {
                                const generado = hitsPorHora[hora];
                                return (
                                    <td key={index} className={generado >= meta ? `tabla__td generadores__check` : `tabla__td generadores__uncheck`}>
                                        {generado}
                                    </td>
                                );
                            })}
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

export default DesblockingHora;