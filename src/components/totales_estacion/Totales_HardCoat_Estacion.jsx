import { useEffect, useState, useRef } from "react";
import clienteAxios from "../../../config/clienteAxios";
import { Link, useLocation } from "react-router-dom";
import moment from 'moment-timezone';

moment.tz.setDefault('America/Mexico_City');

const Totales_HardCoat_Estacion = () => {
    const location = useLocation();
    const hardcoatRef = useRef(null);
    const [registros, setRegistros] = useState([]);
    const [totalesPorTurno, setTotalesPorTurno] = useState({
        matutino: 0,
        vespertino: 0,
        nocturno: 0
    });

    useEffect(() => {
        if (location.hash === '#hardcoat' && hardcoatRef.current) {
            setTimeout(() => {
                const yOffset = -90;
                const element = hardcoatRef.current;
                const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }, 100);
        }
    }, [location]);

    useEffect(() => {
        const obtenerRegistros = async () => {
            const { data } = await clienteAxios(`/manual/manual/actualdia`);
            const registrosAR = data.registros.filter(registro => {
                return ['46', '48', '49', '50', '91', '92'].some(num => registro.name.includes(num));
            });

            const ahora = moment();
            let inicioHoy = moment().startOf('day').add(22, 'hours'); // 22:00 del día anterior
            let finHoy = moment(inicioHoy).add(1, 'days').subtract(30, 'minutes'); // 21:30 del día siguiente

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

    const calcularTotalesPorTurno = (registros, inicioHoy) => {
        const totales = {
            matutino: 0,
            vespertino: 0,
            nocturno: 0
        };

        registros.forEach(registro => {
            const fechaHoraRegistro = moment(`${registro.fecha} ${registro.hour}`, 'YYYY-MM-DD HH:mm:ss');

            // Turno Nocturno: 22:00 a 05:59
            if (fechaHoraRegistro.isBetween(inicioHoy.clone(), inicioHoy.clone().add(8, 'hours'), null, '[)')) {
                totales.nocturno += registro.hits;
            }
            // Turno Matutino: 06:30 a 13:29
            else if (fechaHoraRegistro.isBetween(inicioHoy.clone().add(8, 'hours').add(30, 'minutes'), inicioHoy.clone().add(16, 'hours'), null, '[)')) {
                totales.matutino += registro.hits;
            }
            // Turno Vespertino: 14:30 a 21:30
            else if (fechaHoraRegistro.isBetween(inicioHoy.clone().add(16, 'hours').add(30, 'minutes'), inicioHoy.clone().add(23, 'hours').add(30, 'minutes'), null, '[)')) {
                totales.vespertino += registro.hits;
            }
        });

        setTotalesPorTurno(totales);
    };

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

    const ordenarHorasPorTurno = (horas) => {
        const ordenTurnos = [
            '21:30', '20:30', '19:30', '18:30', '17:30', '16:30', '15:30', '14:30', // Vespertino
            '13:30', '12:30', '11:30', '10:30', '09:30', '08:30', '07:30', '06:30', // Matutino
            '05:00', '04:00', '03:00', '02:00', '01:00', '00:00', '23:00', '22:00'  // Nocturno
        ];
        return ordenTurnos.filter(hora => horas.includes(hora));
    };

    const hitsPorHora = agruparHitsPorHora();
    const horasOrdenadas = ordenarHorasPorTurno(Object.keys(hitsPorHora));
    const filaGenerados = horasOrdenadas.map((hora) => hitsPorHora[hora]);

    const calcularRangoHoras = (horaInicio) => {
        const inicio = moment(horaInicio, 'HH:mm');
        const fin = moment(horaInicio, 'HH:mm').add(1, 'hour');
        return `${inicio.format('HH:mm')} - ${fin.format('HH:mm')}`;
    };

    return (
        <div className="max-w-screen-xl rounded-lg">
            <div className="hidden lg:block" ref={hardcoatRef}>
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
                            <Link to={'/totales_hardcoat_maquina'} className="link__tabla">
                                <div className="flex items-center justify-center hover:scale-105 transition-transform duration-300">
                                    <img src="./img/ver.png" alt="" width={25} className="relative left-6"/>
                                    <td className="py-5 px-4 border-b min-w-[150px] whitespace-nowrap text-center">Hard Coat</td>
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
                {/* Sección de totales para pantallas grandes */}
                <div className='flex flex-col md:flex-row justify-around mt-4 font-semibold mb-4'>
                    <div className="bg-white p-2 px-10 rounded-lg mb-2 md:mb-0 shadow-md">
                        <p className="text-gray-600 text-sm md:text-base">
                            Total Nocturno Acumulado: 
                            <span className="ml-1 font-bold text-gray-700">{totalesPorTurno.nocturno}</span>
                        </p>
                    </div>
                    <div className="bg-white p-2 px-10 rounded-lg mb-2 md:mb-0 shadow-md">
                        <p className="text-gray-600 text-sm md:text-base">
                            Total Matutino Acumulado: 
                            <span className="ml-1 font-bold text-gray-700">{totalesPorTurno.matutino}</span>
                        </p>
                    </div>
                    <div className="bg-white p-2 px-10 rounded-lg shadow-md">
                        <p className="text-gray-600 text-sm md:text-base">
                            Total Vespertino Acumulado: 
                            <span className="ml-1 font-bold text-gray-700">{totalesPorTurno.vespertino}</span>
                        </p>
                    </div>
                </div>
            </div>
            {/* Diseño tipo card para pantallas pequeñas y medianas */}
            <div className="block lg:hidden mt-4">
                <div className="bg-white shadow-md rounded-lg mb-4 p-6">
                    <div className="flex justify-between border-b pb-2">
                        <span className="font-bold text-gray-700">Nombre:</span>
                        <span className="font-bold text-gray-700">Hard Coat</span>
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
                        <Link to={'/totales_hardcoat_maquina'} className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
                            <button className="text-white font-bold uppercase">Ver Detalles</button>
                        </Link>
                    </div>
                    {/* Sección de totales para pantallas pequeñas y medianas */}
                    <div className="mt-6 border-t pt-4">
                        <div className="bg-green-50 p-4 rounded-lg shadow-md">
                            <h4 className="font-semibold text-green-700 mb-2">Totales por Turno</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <span className="block text-gray-600">Nocturno: </span>
                                    <span className="font-semibold text-md text-gray-700">{totalesPorTurno.nocturno}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-600">Matutino: </span>
                                    <span className="font-semibold text-md text-gray-700">{totalesPorTurno.matutino}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-600">Vespertino: </span>
                                    <span className="text-md font-semibold text-gray-700">{totalesPorTurno.vespertino}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Totales_HardCoat_Estacion;