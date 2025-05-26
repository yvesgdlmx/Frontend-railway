import React, { useEffect, useState } from 'react';
import Heading from '../../components/others/Heading';
import Actualizacion from '../../components/others/Actualizacion';
import clienteAxios from '../../../config/clienteAxios';
import RazonesDeMerma from '../../components/mermas/RazonesDeMerma';
import GraficaMermasPorHora from '../../components/others/charts/GraficaMermasPorHora';
import { InformationCircleIcon } from '@heroicons/react/20/solid';
// Función para obtener la fecha en formato "YYYY-MM-DD"
const obtenerFechaLocal = (fecha) => {
  const anio = fecha.getFullYear();
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const dia = fecha.getDate().toString().padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};
// Función para formatear la fecha con nombre (ej. "lunes 25 de enero del 2025")
const obtenerFechaConNombre = (fecha) => {
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};
const MermaPorHora = () => {
  const [ultimoRegistroIntervalo, setUltimoRegistroIntervalo] = useState('Sin datos');
  const [piezasPorHora, setPiezasPorHora] = useState('Sin datos');
  const [piezasPorDia, setPiezasPorDia] = useState('Sin datos');
  const [porcentajePorHora, setPorcentajePorHora] = useState('Sin datos');
  const [porcentajeAcumuladoDia, setPorcentajeAcumuladoDia] = useState('Sin datos');
  // Estados para almacenar los valores reales para la fórmula:
  const [mermaHora, setMermaHora] = useState(null);
  const [produccionHora, setProduccionHora] = useState(null);
  const [totalProduccionDia, setTotalProduccionDia] = useState(null);
  // Función para obtener el rango de 1 hora a partir de una hora dada.
  const obtenerIntervalo = (horaStr) => {
    const inicio = horaStr.slice(0, 5);
    const [hora, minutos] = inicio.split(':');
    const horaEntera = Number(hora) + 1;
    const horaFin = horaEntera < 10 ? `0${horaEntera}` : horaEntera;
    return `${inicio} - ${horaFin}:${minutos}`;
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const ahora = new Date();
        const horaActual = ahora.getHours();
        let fechaObjetivo, fechaAnterior;
        // Lógica de turno:
        if (horaActual < 22) {
          // Día actual
          fechaObjetivo = obtenerFechaLocal(ahora);
          const ayer = new Date(ahora);
          ayer.setDate(ahora.getDate() - 1);
          // Día anterior
          fechaAnterior = obtenerFechaLocal(ayer);
        } else {
          // Mañana
          fechaObjetivo = obtenerFechaLocal(new Date(ahora.getTime() + 24 * 60 * 60 * 1000));
          // Día actual
          fechaAnterior = obtenerFechaLocal(ahora);
        }
        // Llamada al endpoint: /mermas/conteo_de_mermas
        const respMermas = await clienteAxios.get('/mermas/conteo_de_mermas');
        const datos = respMermas.data.registros;
        // Filtrar registros del turno:
        const registrosTurno = datos.filter(reg => {
          if (reg.fecha === fechaAnterior && reg.hora >= "22:00:00") return true;
          if (reg.fecha === fechaObjetivo && reg.hora < "22:00:00") return true;
          return false;
        });
        let ultimoRegistro = null;
        let totalDiaMermas = 0;
        if (registrosTurno.length > 0) {
          // Función auxiliar para combinar fecha y hora y poder comparar
          const obtenerFechaCompleta = (reg) => `${reg.fecha} ${reg.hora}`;
          ultimoRegistro = registrosTurno.reduce((prev, current) =>
            obtenerFechaCompleta(current) > obtenerFechaCompleta(prev) ? current : prev
          );
          const intervalo = obtenerIntervalo(ultimoRegistro.hora);
          setUltimoRegistroIntervalo(intervalo);
          setPiezasPorHora(ultimoRegistro.total);
          totalDiaMermas = registrosTurno.reduce((acc, reg) => acc + Number(reg.total), 0);
          setPiezasPorDia(totalDiaMermas);
        } else {
          setUltimoRegistroIntervalo('Sin registros en este turno');
          setPiezasPorHora('Sin datos');
          setPiezasPorDia('Sin datos');
        }
        // Llamada al endpoint: /mermas/produccion
        const respProduccion = await clienteAxios.get('/mermas/produccion');
        const registrosProduccionTurno = respProduccion.data.registros.filter(prod => {
          if (prod.fecha === fechaAnterior && prod.hour >= "22:00:00") return true;
          if (prod.fecha === fechaObjetivo && prod.hour < "22:00:00") return true;
          return false;
        });
        // Total de producción diaria ajustado (multiplicado por 2)
        const totalProduccionDiaCalc = registrosProduccionTurno.reduce((acc, prod) => acc + Number(prod.hits), 0);
        const totalProduccionAjustado = totalProduccionDiaCalc * 2;
        if (totalProduccionAjustado > 0) {
          const porcentajeAcumulado = ((totalDiaMermas / totalProduccionAjustado) * 100).toFixed(2);
          setPorcentajeAcumuladoDia(`${porcentajeAcumulado}%`);
          setTotalProduccionDia(totalProduccionAjustado);
        } else {
          setPorcentajeAcumuladoDia('Sin datos');
        }
        // Calcular el porcentaje por hora usando el registro de producción más reciente
        if (ultimoRegistro && registrosProduccionTurno.length > 0) {
          const ultimoRegistroProduccion = registrosProduccionTurno.reduce((prev, current) => {
            const prevDate = new Date(`${prev.fecha}T${prev.hour}`);
            const currentDate = new Date(`${current.fecha}T${current.hour}`);
            return currentDate > prevDate ? current : prev;
          });
          // Producción de la hora actual ajustada (multiplicada por 2)
          const produccionHoraCalc = Number(ultimoRegistroProduccion.hits) * 2;
          const mermasHoraCalc = Number(ultimoRegistro.total);
          const porcentajeHora = produccionHoraCalc > 0 ? ((mermasHoraCalc / produccionHoraCalc) * 100).toFixed(2) : 0;
          setPorcentajePorHora(`${porcentajeHora}%`);
          setMermaHora(mermasHoraCalc);
          setProduccionHora(produccionHoraCalc);
        } else {
          setPorcentajePorHora('Sin datos');
        }
      } catch (error) {
        console.error('Error al obtener datos del endpoint:', error);
        setUltimoRegistroIntervalo('Error al cargar datos');
        setPiezasPorHora('Error al cargar datos');
        setPiezasPorDia('Error al cargar datos');
        setPorcentajePorHora('Error al cargar datos');
        setPorcentajeAcumuladoDia('Error al cargar datos');
      }
    };
    fetchData();
  }, []);
  // Obtener la fecha actual formateada con nombre
  const fechaActualFormateada = obtenerFechaConNombre(new Date());
  return (
    <>
      <div className="mt-6 md:mt-2">
        <Heading title="Mermas por hora" />
      </div>
      {/* Sección para mostrar la fecha actual */}
      <div className="text-center mb-4">
        <p className="text-gray-600 font-medium uppercase">
          FECHA: {fechaActualFormateada}
        </p>
      </div>
      <Actualizacion />
      <div className="">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Card informativa: ahora se muestra en 12 columnas en pantallas pequeñas/medianas, y en 5 columnas en pantallas grandes */}
          <div className="md:col-span-12 lg:col-span-5">
            <div className="bg-white p-4 rounded shadow-md h-full">
              <h2 className="text-xl font-semibold text-center mb-4 text-gray-500 uppercase">
                Información de Mermas
              </h2>
              <div className="grid grid-cols-1 gap-4 mt-12">
                <div className="bg-gray-100 p-3 rounded-lg text-center">
                  <p className="text-xs md:text-sm font-medium text-gray-600 uppercase">Último registro</p>
                  <p className="text-xl md:text-2xl font-bold text-cyan-600">{ultimoRegistroIntervalo}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-100 p-3 rounded-lg text-center">
                  <p className="text-xs md:text-sm font-medium text-gray-600 uppercase">Piezas hora actual</p>
                  <p className="text-xl md:text-2xl font-semibold text-red-600">{piezasPorHora}</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg text-center">
                  <p className="text-xs md:text-sm font-medium text-gray-600 uppercase">Piezas Acumulado</p>
                  <p className="text-xl md:text-2xl font-semibold text-red-600">{piezasPorDia}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <div className="bg-gray-100 p-3 rounded-lg text-center">
                    <p className="text-xs md:text-sm font-medium text-gray-600 uppercase">% hora actual</p>
                    <p className="text-xl md:text-2xl font-semibold text-red-600">{porcentajePorHora}</p>
                  </div>
                  <div className="mt-1 text-center text-xs text-gray-500">
                    ( % por hora = ({mermaHora !== null ? mermaHora : '-' } / {produccionHora !== null ? produccionHora : '-'}) * 100 = {porcentajePorHora} )
                  </div>
                </div>
                <div>
                  <div className="bg-gray-100 p-3 rounded-lg text-center">
                    <p className="text-xs md:text-sm font-medium text-gray-600 uppercase">% acumulado del día</p>
                    <p className="text-xl md:text-2xl font-semibold text-red-600">{porcentajeAcumuladoDia}</p>
                  </div>
                  <div className="mt-1 text-center text-xs text-gray-500">
                    ( % acumulado = ({typeof piezasPorDia === 'number' ? piezasPorDia : '-' } / {totalProduccionDia !== null ? totalProduccionDia : '-'}) * 100 = {porcentajeAcumuladoDia} )
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-md flex items-start mt-24">
                <InformationCircleIcon className="h-6 w-6 text-blue-500 flex-shrink-0" />
                <p className="ml-3 text-xs md:text-sm text-blue-700">
                  El porcentaje por hora refleja las mermas de la hora actual en relación con la producción registrada en el mismo período. Por otro lado, el porcentaje acumulado del día se determina comparando las mermas totales con la producción total diaria (ajustada).
                </p>
              </div>
            </div>
          </div>
          {/* Card que muestra la gráfica: se oculta en pantallas pequeñas y medianas */}
          <div className="hidden lg:block lg:col-span-7 mt-4 lg:mt-0">
            <div className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-semibold text-gray-500 mb-2 text-center uppercase">
                Gráfica de Mermas
              </h2>
              <GraficaMermasPorHora />
            </div>
          </div>
        </div>
        <div className="mt-10">
          <RazonesDeMerma />
        </div>
      </div>
    </>
  );
};
export default MermaPorHora;