import { useState, useEffect } from "react";
import clienteAxios from "../config/clienteAxios";
import { Link } from "react-router-dom";

const ManualProcesos = () => {
    const [totalHits, setTotalHits] = useState(0);
    const [ultimaHora, setUltimaHora] = useState("");
    const [siguienteHora, setSiguienteHora] = useState("");
    const [meta, setMeta] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Obtener la suma de metas de los generadores
                const responseMetas = await clienteAxios.get('/metas/metas-manuales');
                const sumaMetas = responseMetas.data.registros.reduce((acc, curr) => acc + curr.meta, 0);

                // Obtener registros del día actual y calcular total de hits
                const responseRegistros = await clienteAxios.get('/manual/manual/actualdia');
                const registros = responseRegistros.data.registros;

                // Filtrar registros entre las 06:30 y las 23:00
                const horaInicio = new Date('1970/01/01 06:30:00');
                const horaFin = new Date('1970/01/01 23:00:00');
                const registrosFiltrados = registros.filter(registro => {
                    const horaRegistro = new Date('1970/01/01 ' + registro.hour);
                    return horaRegistro >= horaInicio && horaRegistro <= horaFin;
                });

                const total = registrosFiltrados.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
                setTotalHits(total);

                // Determinar la hora más cercana y la siguiente hora
                const ahora = new Date();
                let horaMasCercana = registrosFiltrados[0]?.hour || "06:30";
                let diferenciaMasCercana = Infinity;

                registrosFiltrados.forEach(registro => {
                    const diferencia = Math.abs(new Date('1970/01/01 ' + `${ahora.getHours()}:${ahora.getMinutes()}:${ahora.getSeconds()}`) - new Date('1970/01/01 ' + registro.hour));
                    if (diferencia < diferenciaMasCercana) {
                        horaMasCercana = registro.hour;
                        diferenciaMasCercana = diferencia;
                    }
                });

                const formattedLastHour = new Date('1970/01/01 ' + horaMasCercana);
                setUltimaHora(`${formattedLastHour.getHours().toString().padStart(2, '0')}:${formattedLastHour.getMinutes().toString().padStart(2, '0')}`);

                const horaFinal = new Date('1970/01/01 ' + horaMasCercana);
                // Redondear la hora final a la media hora más cercana
                horaFinal.setMinutes(horaFinal.getMinutes() + 30 - (horaFinal.getMinutes() % 30));
                const horasTranscurridas = (horaFinal - horaInicio) / (1000 * 60 * 60);
                setMeta(Math.round(horasTranscurridas) * sumaMetas);

                // Configurar la siguiente hora
                const siguienteHoraDate = new Date(horaFinal.getTime());
                siguienteHoraDate.setMinutes(siguienteHoraDate.getMinutes() + 30);
                setSiguienteHora(`${siguienteHoraDate.getHours().toString().padStart(2, '0')}:${siguienteHoraDate.getMinutes().toString().padStart(2, '0')}`);
            } catch (error) {
                console.error("Error al obtener los datos:", error);
            }
        };
        fetchData();
    }, []);

    console.log(totalHits)
    return (
        <>
            <div className="procesos__flex mt">
                <Link className="link" to={'/procesos-horas#manuales'}>
                    <div className="procesos">
                        <div className="procesos__campo-name">
                            <p className="procesos__p">Estaciones Manuales</p>
                        </div>
                        <div className="procesos__campo-manuales">
                            <p className="procesos__p">Trabajos: <br /> <span className={meta > totalHits ? `procesos__span-2 generadores__uncheck` : `procesos__span-2 generadores__check`}>{totalHits}</span></p>
                            <p className="procesos__p">Meta: <br /> <span className="procesos__span">{meta}</span></p>
                            <p className="procesos__p">Último registro: <br /> <span className="procesos__span">{ultimaHora} - {siguienteHora}</span></p>
                        </div>
                    </div>
                </Link>
            </div>
        </>
    );
};

export default ManualProcesos;