import { useEffect, useState } from "react";
import clienteAxios from "../config/clienteAxios";
import { Link, useLocation } from "react-router-dom";
import formatearHora from "../helpers/formatearHora";

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
            const { data } = await clienteAxios(`/metas/metas-manuales`);
            const metaDesblocking = data.registros.find(registro => registro.name === '19 DEBLOCKING');
            if (metaDesblocking) {
                setMeta(metaDesblocking.meta);
                console.log('Meta obtenida:', metaDesblocking.meta); // Verifica el valor de la meta
            }
        };
        obtenerMeta();
    }, []);

    useEffect(() => {
        const obtenerRegistros = async () => {
            const { data } = await clienteAxios(`/manual/manual/actualdia`);
            const registrosDesblocking = data.registros.filter(registro => registro.name.includes('DEBLOCKING'));
            const registrosFiltrados = registrosDesblocking.filter(registro => {
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
            }
            if (minutosTotales >= 870 && minutosTotales < 1290) { // 14:30 - 21:30
                totales.vespertino += registro.hits;
            }
            if (minutosTotales >= 1290 || minutosTotales < 90) { // 21:30 - 01:30
                totales.nocturno += registro.hits;
            }
        });
        setTotalesPorTurno(totales);
    };

    const calcularMetaPorTurno = (horasTurno) => {
        return meta * horasTurno;
    };

    const hitsPorHora = agruparHitsPorHora();
    console.log('Hits por hora:', hitsPorHora); // Verifica los valores de hits por hora
    const horasOrdenadas = Object.keys(hitsPorHora).sort().reverse();

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

    const metaMatutinoFinal = calcularMetaPorTurno(8); // 8 horas para el turno matutino
    const metaVespertinoFinal = calcularMetaPorTurno(7); // 7 horas para el turno vespertino
    const metaNocturnoFinal = calcularMetaPorTurno(4); // 4 horas para el turno nocturno

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
                                    <td className="tabla__td position">Desbloqueo <br/> <span className="tabla__td-span">Meta: <span className="tabla__span-meta">{meta}</span></span></td>
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