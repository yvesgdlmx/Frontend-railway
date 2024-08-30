import { useState, useEffect } from "react";
import clienteAxios from "../config/clienteAxios";
import { Link } from "react-router-dom";

const ARProcesos = () => {
    const [totalHits, setTotalHits] = useState(0);
    const [ultimaHora, setUltimaHora] = useState("");
    const [siguienteHora, setSiguienteHora] = useState("");
    const [hitsMatutino, setHitsMatutino] = useState(0);
    const [hitsVespertino, setHitsVespertino] = useState(0);
    const [hitsNocturno, setHitsNocturno] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Obtener registros del día actual
                const responseRegistros = await clienteAxios.get('/manual/manual/actualdia');
                console.log("Registros obtenidos:", responseRegistros.data.registros);

                // Filtrar registros que corresponden a las estaciones 91, 92 y del 52 al 56
                const registros = responseRegistros.data.registros.filter(registro => {
                    const num = parseInt(registro.name.split(' ')[0], 10);
                    return num === 91 || num === 92 || (num >= 52 && num <= 56);
                });
                console.log("Registros filtrados (AR):", registros);

                // Filtrar registros entre las 06:30 y las 23:00
                const horaInicio = new Date('1970/01/01 06:30:00');
                const horaFin = new Date('1970/01/01 23:00:00');
                const registrosFiltrados = registros.filter(registro => {
                    const horaRegistro = new Date('1970/01/01 ' + registro.hour);
                    return horaRegistro >= horaInicio && horaRegistro <= horaFin;
                });
                console.log("Registros filtrados por hora:", registrosFiltrados);

                // Calcular hits totales
                const total = registrosFiltrados.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
                setTotalHits(total);
                console.log("Total hits:", total);

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
                console.log("Última hora:", ultimaHora);
                const horaFinal = new Date('1970/01/01 ' + horaMasCercana);

                // Configurar la siguiente hora
                horaFinal.setMinutes(horaFinal.getMinutes() + 30 - (horaFinal.getMinutes() % 30));
                const siguienteHoraDate = new Date(horaFinal.getTime());
                siguienteHoraDate.setMinutes(siguienteHoraDate.getMinutes() + 30);
                setSiguienteHora(`${siguienteHoraDate.getHours().toString().padStart(2, '0')}:${siguienteHoraDate.getMinutes().toString().padStart(2, '0')}`);
                console.log("Siguiente hora:", siguienteHora);

                // Calcular hits por turno
                const horaMatutinoInicio = new Date('1970/01/01 06:30:00');
                const horaMatutinoFin = new Date('1970/01/01 14:30:00');
                const horaVespertinoInicio = new Date('1970/01/01 14:30:00');
                const horaVespertinoFin = new Date('1970/01/01 21:30:00');
                const horaNocturnoInicio = new Date('1970/01/01 21:30:00');
                const horaNocturnoFin = new Date('1970/01/01 23:59:59');
                const hitsMatutino = registrosFiltrados.filter(registro => {
                    const horaRegistro = new Date('1970/01/01 ' + registro.hour);
                    return horaRegistro >= horaMatutinoInicio && horaRegistro < horaMatutinoFin;
                }).reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
                const hitsVespertino = registrosFiltrados.filter(registro => {
                    const horaRegistro = new Date('1970/01/01 ' + registro.hour);
                    return horaRegistro >= horaVespertinoInicio && horaRegistro < horaVespertinoFin;
                }).reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
                const hitsNocturno = registrosFiltrados.filter(registro => {
                    const horaRegistro = new Date('1970/01/01 ' + registro.hour);
                    return horaRegistro >= horaNocturnoInicio;
                }).reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
                setHitsMatutino(hitsMatutino);
                setHitsVespertino(hitsVespertino);
                setHitsNocturno(hitsNocturno);

            } catch (error) {
                console.error("Error al obtener los datos:", error);
            }
        };
        fetchData();
    }, []);

    return (
        <>
            <Link className="link" to={'/procesos-horas#arhora'}>
                <div className="procesos-2">
                    <div className="procesos-2__flex">
                        <p className="procesos-2__p-azul">AR</p>
                        <div className="procesos__campo-ar">
                            <p className="procesos-2__p">Trabajos: <br /><span className="procesos__span-2">{totalHits}</span></p>
                            <p className="procesos-2__p">Último Registro: <br /><span className="procesos-2__span">{ultimaHora} - {siguienteHora}</span></p>
                            <p className="procesos-2__p">Matutino: <br /><span>{hitsMatutino}</span></p>
                            <p className="procesos-2__p">Vespertino: <br /><span>{hitsVespertino}</span></p>
                            <p className="procesos-2__p">Nocturno: <br /><span >{hitsNocturno}</span></p>
                        </div>
                    </div>
                </div>
            </Link>
        </>
    );
};

export default ARProcesos;