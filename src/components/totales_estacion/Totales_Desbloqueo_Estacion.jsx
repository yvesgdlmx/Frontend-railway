import { useEffect, useState } from "react";
import clienteAxios from "../../../config/clienteAxios";
import { Link, useLocation } from "react-router-dom";
import formatearHora from "../../../helpers/formatearHora";
import moment from 'moment-timezone';

moment.tz.setDefault('America/Mexico_City');

const Totales_Desbloqueo_Estacion = () => {
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
            }
        };
        obtenerMeta();
    }, []);

    useEffect(() => {
        const obtenerRegistros = async () => {
            const { data } = await clienteAxios(`/manual/manual/actualdia`);
            const registrosDesblocking = data.registros.filter(registro => registro.name.includes('DEBLOCKING'));
            
            const ahora = moment();
            let inicioHoy = moment().startOf('day').add(6, 'hours').add(30, 'minutes');
            let finHoy = moment(inicioHoy).add(1, 'days');

            if (ahora.isBefore(inicioHoy)) {
                inicioHoy.subtract(1, 'days');
                finHoy.subtract(1, 'days');
            }

            const registrosFiltrados = registrosDesblocking.filter(registro => {
                const fechaHoraRegistro = moment(`${registro.fecha} ${registro.hour}`, 'YYYY-MM-DD HH:mm:ss');
                return fechaHoraRegistro.isBetween(inicioHoy, finHoy, null, '[)');
            });

            setRegistros(registrosFiltrados);
            calcularTotalesPorTurno(registrosFiltrados, inicioHoy);
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
            const fechaHoraRegistro = moment(`${registro.fecha} ${registro.hour}`, 'YYYY-MM-DD HH:mm:ss');
            const horaFormateada = fechaHoraRegistro.format('HH:mm');
            if (hitsPorHora[horaFormateada]) {
                hitsPorHora[horaFormateada] += registro.hits;
            } else {
                hitsPorHora[horaFormateada] = registro.hits;
            }
        });
        return hitsPorHora;
    };

    const calcularTotalesPorTurno = (registros, inicioHoy) => {
        const totales = {
            matutino: 0,
            vespertino: 0,
            nocturno: 0
        };
        registros.forEach(registro => {
            const fechaHoraRegistro = moment(`${registro.fecha} ${registro.hour}`, 'YYYY-MM-DD HH:mm:ss');
            if (fechaHoraRegistro.isBetween(inicioHoy, moment(inicioHoy).add(8, 'hours'), null, '[)')) {
                totales.matutino += registro.hits;
            } else if (fechaHoraRegistro.isBetween(moment(inicioHoy).add(8, 'hours'), moment(inicioHoy).add(15, 'hours'), null, '[)')) {
                totales.vespertino += registro.hits;
            } else {
                totales.nocturno += registro.hits;
            }
        });
        setTotalesPorTurno(totales);
    };

    const obtenerHoraActual = () => {
        return moment().format('HH:mm');
    };

    const ajustarMetaPorTurno = (horaInicio, horaActual, metaPorHora) => {
        const inicioTurno = moment(horaInicio, 'HH:mm');
        const actual = moment(horaActual, 'HH:mm');
        if (actual.isBefore(inicioTurno)) {
            actual.add(1, 'day');
        }
        const duracion = moment.duration(actual.diff(inicioTurno));
        const horasTranscurridas = Math.max(1, Math.ceil(duracion.asHours()));
        return horasTranscurridas * metaPorHora;
    };

    const hitsPorHora = agruparHitsPorHora();
    const horasOrdenadas = Object.keys(hitsPorHora).sort((a, b) => {
        const momentA = moment(a, 'HH:mm');
        const momentB = moment(b, 'HH:mm');
        if (momentA.isBefore(moment('06:30', 'HH:mm'))) momentA.add(1, 'day');
        if (momentB.isBefore(moment('06:30', 'HH:mm'))) momentB.add(1, 'day');
        return momentB.diff(momentA);
    });
    const filaGenerados = horasOrdenadas.map((hora) => hitsPorHora[hora]);

    const horaActual = obtenerHoraActual();
    const metaMatutinoFinal = ajustarMetaPorTurno("06:30", horaActual, meta);
    const metaVespertinoFinal = ajustarMetaPorTurno("14:30", horaActual, meta);
    const metaNocturnoFinal = ajustarMetaPorTurno("22:30", horaActual, meta);

    const calcularRangoHoras = (horaInicio) => {
        const inicio = moment(horaInicio, 'HH:mm');
        const fin = moment(horaInicio, 'HH:mm').add(1, 'hour');
        return `${inicio.format('HH:mm')} - ${fin.format('HH:mm')}`;
    };

    const getClassName = (hits, metaPorTurno) => {
        return hits >= metaPorTurno ? "text-green-800" : "text-red-800";
    };

    return (
        <div className="max-w-screen-xl rounded-lg" id="desbloqueo">
            {/* Estructura para pantallas grandes */}
            <div className="hidden lg:block">
                <table className="min-w-full bg-white border">
                    <thead>
                        <tr className="bg-blue-500 text-white border-l-2">
                            <th className="py-2 px-4 min-w-[150px] whitespace-nowrap"></th>
                            {horasOrdenadas.map((hora) => (
                                <th key={hora} className="py-2 px-4 border-b min-w-[150px] whitespace-nowrap">
                                    {calcularRangoHoras(hora)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="font-semibold text-gray-700">
                            <Link to={'/totales_desblocking_maquina'} className="link__tabla">
                                <div className="flex items-center justify-center hover:scale-105 transition-transform duration-300">
                                <img src="./img/ver.png" alt="" width={25} className="relative left-6"/>
                                    <td className="py-2 px-4 border-b min-w-[150px] whitespace-nowrap text-center">
                                        Desbloqueo <br />
                                        <span className="text-gray-500">Meta: <span>{meta}</span></span>
                                    </td>
                                </div>
                            </Link>
                            {filaGenerados.map((generado, index) => (
                                <td key={index} className="py-2 px-4 border-b font-bold border-l-2 border-gray-200 min-w-[150px] whitespace-nowrap text-center">
                                    <span className={getClassName(generado, meta)}>{generado}</span>
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
            {/* Diseño tipo card para pantallas pequeñas y medianas */}
            <div className="block lg:hidden mt-4">
                <div className="bg-white shadow-md rounded-lg mb-4 p-6">
                    <div className="flex justify-between border-b pb-2">
                        <span className="font-bold text-gray-700">Nombre:</span>
                        <span className="font-bold text-gray-700">Desbloqueo</span>
                    </div>
                    <div className="flex justify-between border-b py-4">
                        <span className="font-bold text-gray-700">Meta:</span>
                        <span className="font-bold text-gray-700">{meta || 'No definida'}</span>
                    </div>
                    <div className="py-4">
                        <span className="font-bold text-gray-700">Horas:</span>
                        {horasOrdenadas.map((hora, idx) => {
                            const totalHits = hitsPorHora[hora];
                            const bgColor = idx % 2 === 0 ? 'bg-slate-200' : 'bg-slate-300';
                            const hitsClass = totalHits >= meta ? "text-green-800" : "text-red-800";
                            return (
                                <div key={idx} className={`flex justify-between py-2 px-4 ${bgColor}`}>
                                    <span className="font-bold text-gray-700">{calcularRangoHoras(hora)}:</span>
                                    <span className={`font-bold ${hitsClass}`}>{totalHits}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-center mt-4">
                        <Link to={'/totales_desblocking_maquina'} className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
                            <button className="text-white font-bold uppercase">Ver Detalles</button>
                        </Link>
                    </div>
                </div>
            </div>
            <div className='flex flex-col md:flex-row justify-around mt-4 font-semibold mb-4'>
                <div className="bg-white p-2 px-10 rounded-lg mb-2 md:mb-0">
                    <p className="text-gray-700">Total Matutino: <span className={getClassName(totalesPorTurno.matutino, metaMatutinoFinal)}>{totalesPorTurno.matutino}</span></p>
                </div>
                <div className="bg-white p-2 px-10 rounded-lg mb-2 md:mb-0">
                    <p className="text-gray-700">Total Vespertino: <span className={getClassName(totalesPorTurno.vespertino, metaVespertinoFinal)}>{totalesPorTurno.vespertino}</span></p>
                </div>
                <div className="bg-white p-2 px-10 rounded-lg">
                    <p className="text-gray-700">Total Nocturno: <span className={getClassName(totalesPorTurno.nocturno, metaNocturnoFinal)}>{totalesPorTurno.nocturno}</span></p>
                </div>
            </div>
            <div className="border-b-4 lg:border-b-0"></div>
        </div>
    );
};

export default Totales_Desbloqueo_Estacion;