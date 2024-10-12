import { useState, useEffect } from "react";
import clienteAxios from "../config/clienteAxios";
import { Link } from "react-router-dom";

const TalladosProcesos = () => {
    const [totalHits, setTotalHits] = useState(0);
    const [ultimaHora, setUltimaHora] = useState("");
    const [siguienteHora, setSiguienteHora] = useState("");
    const [meta, setMeta] = useState(0);
    const [hitsMatutino, setHitsMatutino] = useState(0);
    const [hitsVespertino, setHitsVespertino] = useState(0);
    const [hitsNocturno, setHitsNocturno] = useState(0);
    const [metaMatutino, setMetaMatutino] = useState(0);
    const [metaVespertino, setMetaVespertino] = useState(0);
    const [metaNocturno, setMetaNocturno] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Obtener la suma de metas de los generadores
                const responseMetas = await clienteAxios.get('/metas/metas-tallados');
                const sumaMetas = responseMetas.data.registros.reduce((acc, curr) => acc + curr.meta, 0);

                // Obtener registros del día actual y calcular total de hits
                const responseRegistros = await clienteAxios.get('/tallado/tallado/actualdia');
                const registros = responseRegistros.data.registros;

                // Obtener la fecha actual
                const ahora = new Date();
                const fechaActual = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

                // Calcular los rangos de tiempo para cada turno
                const horaMatutinoInicio = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate(), 6, 30);
                const horaMatutinoFin = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate(), 14, 29);
                const horaVespertinoInicio = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate(), 14, 30);
                const horaVespertinoFin = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate(), 21, 29);
                const horaNocturnoInicio = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate(), 21, 30);
                const horaNocturnoFin = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate() + 1, 6, 30);

                // Filtrar y calcular hits por turno
                const calcularHitsPorTurno = (inicio, fin) => {
                    return registros.filter(registro => {
                        const [hour, minute] = registro.hour.split(':').map(Number);
                        const fechaRegistro = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate(), hour, minute);
                        if (hour < 6) {
                            // Ajustar el día para horas después de medianoche
                            fechaRegistro.setDate(fechaRegistro.getDate() + 1);
                        }
                        return fechaRegistro >= inicio && fechaRegistro <= fin;
                    }).reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
                };

                const hitsMatutino = calcularHitsPorTurno(horaMatutinoInicio, horaMatutinoFin);
                const hitsVespertino = calcularHitsPorTurno(horaVespertinoInicio, horaVespertinoFin);
                const hitsNocturno = calcularHitsPorTurno(horaNocturnoInicio, horaNocturnoFin);

                setHitsMatutino(hitsMatutino);
                setHitsVespertino(hitsVespertino);
                setHitsNocturno(hitsNocturno);

                // Calcular el total de hits
                setTotalHits(hitsMatutino + hitsVespertino + hitsNocturno);

                // Calcular metas por turno
                const horasMatutino = 8; // 8 horas para el turno matutino
                const horasVespertino = 7; // 7 horas para el turno vespertino
                const horasNocturno = 9; // 9 horas para el turno nocturno (de 21:30 a 06:30)
                setMetaMatutino(horasMatutino * sumaMetas);
                setMetaVespertino(horasVespertino * sumaMetas);
                setMetaNocturno(horasNocturno * sumaMetas);

                // Calcular la meta acumulada hasta el momento
                const inicioDia = ahora.getHours() < 6 ? new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate() - 1, 6, 30) : horaMatutinoInicio;
                const tiempoTranscurrido = ahora - inicioDia;
                const horasTranscurridas = Math.max(0, tiempoTranscurrido / (1000 * 60 * 60)); // Convertir de milisegundos a horas
                const metaAcumulada = Math.floor(horasTranscurridas) * sumaMetas;
                setMeta(metaAcumulada);

                // Determinar la hora más cercana y la siguiente hora
                const minutosActuales = ahora.getMinutes();
                const horaActual = ahora.getHours();
                let horaAjustada = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate(), horaActual, 0);
                if (minutosActuales < 30) {
                    horaAjustada.setHours(horaActual - 1);
                } else {
                    horaAjustada.setMinutes(30);
                }
                const horaInicioIntervalo = new Date(horaAjustada.getTime());
                horaInicioIntervalo.setHours(horaInicioIntervalo.getHours() - 1);
                setUltimaHora(`${horaInicioIntervalo.getHours().toString().padStart(2, '0')}:30`);
                const siguienteHoraDate = new Date(horaInicioIntervalo.getTime());
                siguienteHoraDate.setHours(siguienteHoraDate.getHours() + 1);
                setSiguienteHora(`${siguienteHoraDate.getHours().toString().padStart(2, '0')}:30`);
            } catch (error) {
                console.error("Error al obtener los datos:", error);
            }
        };
        fetchData();
    }, []);

    const getClassName = (hits, meta) => {
        if (hits === 0) {
            return "procesos-2__span-negro";
        }
        return hits >= meta ? "procesos-2__span-verde" : "procesos-2__span-rojo";
    };

    return (
        <>
            <Link className="link" to={'/procesos-horas'}>
                <div className="procesos-2">
                    <div className="procesos-2__flex">
                        <p className="procesos-2__p-azul">B. Tallado</p>
                        <div className="procesos__campo-tallados">
                            <p className="procesos-2__p">Trabajos: <br /><span className={meta > totalHits ? `procesos__span-2 generadores__uncheck` : `procesos__span-2 generadores__check`}>{totalHits}</span></p>
                            <p className="procesos-2__p">Meta: <br /><span className="procesos-2__span">{meta}</span></p>
                            <p className="procesos-2__p">Último Registro: <br /><span className="procesos-2__span">{ultimaHora} - {siguienteHora}</span></p>
                            <p className="procesos-2__p">Matutino: <br /><span className={getClassName(hitsMatutino, metaMatutino)}>{hitsMatutino}</span></p>
                            <p className="procesos-2__p">Vespertino: <br /><span className={getClassName(hitsVespertino, metaVespertino)}>{hitsVespertino}</span></p>
                            <p className="procesos-2__p">Nocturno: <br /><span className={getClassName(hitsNocturno, metaNocturno)}>{hitsNocturno}</span></p>
                        </div>
                    </div>
                </div>
            </Link>
        </>
    );
};

export default TalladosProcesos;