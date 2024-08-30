import { useEffect, useState } from "react";
import clienteAxios from "../config/clienteAxios";
import { Link, useLocation } from "react-router-dom";
import formatearHora from "../helpers/formatearHora";

const ManualesHora = () => {
    const [registros, setRegistros] = useState([]);
    const [anio, setAnio] = useState();
    const [mes, setMes] = useState();
    const [dia, setDia] = useState();
    const [meta, setMeta] = useState(0); // Cambiado para usar un solo state de meta

    const location = useLocation();

    useEffect(() => {
        const obtenerMeta = async () => {
            const { data } = await clienteAxios(`/metas/metas-manuales`);
            // Asumiendo que data.registros es un array de objetos como describiste
            const sumaMetas = data.registros.reduce((acc, registro) => acc + registro.meta, 0);
            setMeta(sumaMetas);
        };
        obtenerMeta();
    }, []);

    useEffect(() => {
        const obtenerFechaActual = () => {
            const fechaActual = new Date();
            const ano = fechaActual.getFullYear();
            const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
            const dia = fechaActual.getDate().toString().padStart(2, '0');
            setAnio(ano);
            setMes(mes);
            setDia(dia);
        };
        obtenerFechaActual();
    }, []);

    useEffect(() => {
        const obtenerRegistros = async () => {
            const { data } = await clienteAxios(`/manual/manual/actualdia`);
            setRegistros(data.registros);
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
        const registrosFiltrados = registros.filter(registro => registro.hour >= '06:30:00' && registro.hour < '23:30:00');
        registrosFiltrados.forEach((registro) => {
            const hora = registro.hour;
            if (hitsPorHora[hora]) {
                hitsPorHora[hora] += registro.hits;
            } else {
                hitsPorHora[hora] = registro.hits;
            }
        });
        return hitsPorHora;
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

    return (
        <>
            <div className="generado-hora" id="manuales">
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
                            <Link to={'/manuales-horas'} className="link__tabla">
                                <div className="tabla__th-flex">
                                    <img src="./img/ver.png" alt="imagen-ver" className="tabla__ver" />
                                    <td className="tabla__td position">Manuales <br/> <span className="tabla__td-span">Meta: <span className="tabla__span-meta">{meta}</span></span></td>
                                </div>
                            </Link>
                            {filaGenerados.map((generado, index) => (
                                <td key={index} className={ meta > generado ? `tabla__td generadores__uncheck` : `tabla__td generadores__check`}>{generado}</td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default ManualesHora;