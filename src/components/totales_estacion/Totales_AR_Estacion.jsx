import { useEffect, useState } from "react";
import clienteAxios from "../../../config/clienteAxios";
import { Link, useLocation } from "react-router-dom";
import moment from 'moment-timezone';

moment.tz.setDefault('America/Mexico_City');

const Totales_AR_Estacion = () => {
    const [registros, setRegistros] = useState([]);
    const [totalesPorTurno, setTotalesPorTurno] = useState({
        matutino: 0,
        vespertino: 0,
        nocturno: 0
    });
    const location = useLocation();

    useEffect(() => {
        const obtenerRegistros = async () => {
            const { data } = await clienteAxios(`/manual/manual/actualdia`);
            const registrosAR = data.registros.filter(registro => {
                return ['91', '92', '52', '53', '54', '55', '56'].some(num => registro.name.includes(num));
            });
            
            const ahora = moment();
            let inicioHoy = moment().startOf('day').add(6, 'hours').add(30, 'minutes');
            let finHoy = moment(inicioHoy).add(1, 'days');

            if (ahora.isBefore(inicioHoy)) {
                inicioHoy.subtract(1, 'days');
                finHoy.subtract(1, 'days');
            }

            const registrosFiltrados = registrosAR.filter(registro => {
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

    const calcularRangoHoras = (horaInicio) => {
        const inicio = moment(horaInicio, 'HH:mm');
        const fin = moment(horaInicio, 'HH:mm').add(1, 'hour');
        return `${inicio.format('HH:mm')} - ${fin.format('HH:mm')}`;
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

    return (
        <div className="max-w-screen-xl rounded-lg" id="arhora">
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
                            <Link to={'/totales_ar_maquina'} className="link__tabla">
                                <div className="flex items-center justify-center hover:scale-105 transition-transform duration-300">
                                <img src="./img/ver.png" alt="" width={25} className="relative left-6"/>
                                    <td className="py-5 px-4 border-b min-w-[150px] whitespace-nowrap text-center">AR</td>
                                </div>
                            </Link>
                            {filaGenerados.map((generado, index) => (
                                <td key={index} className="py-2 px-4 border-b font-bold border-l-2 border-gray-200 min-w-[150px] whitespace-nowrap text-center">
                                    <span>{generado}</span>
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
                        <span className="font-bold text-gray-700">AR</span>
                    </div>
                    <div className="py-4">
                        <span className="font-bold text-gray-700">Horas:</span>
                        {horasOrdenadas.map((hora, idx) => {
                            const totalHits = hitsPorHora[hora];
                            const bgColor = idx % 2 === 0 ? 'bg-slate-200' : 'bg-slate-300';
                            return (
                                <div key={idx} className={`flex justify-between py-2 px-4 ${bgColor}`}>
                                    <span className="font-bold text-gray-700">{calcularRangoHoras(hora)}:</span>
                                    <span className="font-bold">{totalHits}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-center mt-4">
                        <Link to={'/totales_ar_maquina'} className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
                            <button className="text-white font-bold uppercase">Ver Detalles</button>
                        </Link>
                    </div>
                </div>
            </div>
            <div className='flex flex-col md:flex-row justify-around mt-4 font-semibold mb-4'>
                <div className="bg-white p-2 px-10 rounded-lg mb-2 md:mb-0">
                    <p className="text-gray-700">Total Matutino: <span>{totalesPorTurno.matutino}</span></p>
                </div>
                <div className="bg-white p-2 px-10 rounded-lg mb-2 md:mb-0">
                    <p className="text-gray-700">Total Vespertino: <span>{totalesPorTurno.vespertino}</span></p>
                </div>
                <div className="bg-white p-2 px-10 rounded-lg">
                    <p className="text-gray-700">Total Nocturno: <span>{totalesPorTurno.nocturno}</span></p>
                </div>
            </div>
            <div className="border-b-4 lg:border-b-0"></div>
        </div>
    );
};

export default Totales_AR_Estacion;