import React, { useEffect, useState } from 'react';
import Heading from '../../components/others/Heading';
import Actualizacion from '../../components/others/Actualizacion';
import clienteAxios from '../../../config/clienteAxios';
import RazonesDeMerma from '../../components/mermas/RazonesDeMerma';
// Importar el componente de la gráfica
import GraficaMermasPorHora from '../../components/others/charts/GraficaMermasPorHora';
const obtenerFechaLocal = (fecha) => {
  const anio = fecha.getFullYear();
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const dia = fecha.getDate().toString().padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};
const MermaPorHora = () => {
  const [ultimoRegistroIntervalo, setUltimoRegistroIntervalo] = useState('Sin datos');
  const [piezasPorHora, setPiezasPorHora] = useState('Sin datos');
  const [piezasPorDia, setPiezasPorDia] = useState('Sin datos');
  const [porcentajePorHora, setPorcentajePorHora] = useState('Sin datos');
  const [porcentajeAcumuladoDia, setPorcentajeAcumuladoDia] = useState('Sin datos');
  // Estados para valores numéricos usados en las fórmulas
  const [mermaHora, setMermaHora] = useState(null);
  const [produccionHora, setProduccionHora] = useState(null);
  const [totalProduccionDia, setTotalProduccionDia] = useState(null);
  // Función para obtener el intervalo de tiempo dado una hora
  // Ejemplo: "14:30" => "14:30 - 15:30"
  const obtenerIntervalo = (horaStr) => {
    const inicio = horaStr.slice(0, 5);
    const [hora, minutos] = inicio.split(':');
    const horaEntera = Number(hora) + 1;
    const horaFin = horaEntera < 10 ? `0${horaEntera}` : horaEntera;
    return `${inicio} - ${horaFin}:${minutos}`;
  };
  // Función que obtiene y filtra los datos de la API según la jornada actual
  const fetchData = async () => {
    try {
      const ahora = new Date();
      const horaActual = ahora.getHours();
      let fechaObjetivo, fechaAnterior;
      // Lógica para determinar el turno laboral:
      // • Si la hora es menor a 22:00 se toma como jornada actual:
      //   del día anterior (>=22:00) y del día actual (<22:00)
      // • Si la hora es 22:00 o mayor, la jornada actual inicia hoy a las 22:00
      //   y finaliza mañana a las 21:59.
      if (horaActual < 22) {
        fechaObjetivo = obtenerFechaLocal(ahora); // día actual
        const ayer = new Date(ahora);
        ayer.setDate(ahora.getDate() - 1);
        fechaAnterior = obtenerFechaLocal(ayer); // día anterior
      } else {
        fechaObjetivo = obtenerFechaLocal(new Date(ahora.getTime() + 24 * 60 * 60 * 1000)); // mañana
        fechaAnterior = obtenerFechaLocal(ahora); // día actual
      }
      // Llamada al endpoint de mermas
      const respMermas = await clienteAxios.get('/mermas/conteo_de_mermas');
      const datos = respMermas.data.registros;
      // Filtrar registros del turno actual:
      // • Del día "fechaAnterior": registros con hora >= "22:00:00"
      // • Del día "fechaObjetivo": registros con hora < "22:00:00"
      const registrosTurno = datos.filter(reg => {
        if (reg.fecha === fechaAnterior && reg.hora >= "22:00:00") return true;
        if (reg.fecha === fechaObjetivo && reg.hora < "22:00:00") return true;
        return false;
      });
      let ultimoRegistro = null;
      let totalDiaMermas = 0;
      if (registrosTurno.length > 0) {
        // Obtener el registro más reciente (usando fecha y hora)
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
      // Llamada al endpoint de producción
      const respProduccion = await clienteAxios.get('/mermas/produccion');
      // Nota: En producción el campo de hora se llama "hour"
      const registrosProduccionTurno = respProduccion.data.registros.filter(prod => {
        if (prod.fecha === fechaAnterior && prod.hour >= "22:00:00") return true;
        if (prod.fecha === fechaObjetivo && prod.hour < "22:00:00") return true;
        return false;
      });
      // Calcular producción total del turno
      const totalProduccionDiaCalc = registrosProduccionTurno.reduce((acc, prod) => acc + Number(prod.hits), 0);
      if (totalProduccionDiaCalc > 0) {
        const porcentajeAcumulado = ((totalDiaMermas / totalProduccionDiaCalc) * 100).toFixed(2);
        setPorcentajeAcumuladoDia(`${porcentajeAcumulado}%`);
        setTotalProduccionDia(totalProduccionDiaCalc);
      } else {
        setPorcentajeAcumuladoDia('Sin datos');
      }
      // Calcular el porcentaje por hora
      if (ultimoRegistro) {
        const registroProduccionHora = respProduccion.data.registros.find(prod => prod.hour === ultimoRegistro.hora);
        if (registroProduccionHora) {
          const produccionHoraCalc = Number(registroProduccionHora.hits);
          const mermasHoraCalc = Number(ultimoRegistro.total);
          const porcentajeHora = produccionHoraCalc > 0 ? ((mermasHoraCalc / produccionHoraCalc) * 100).toFixed(2) : 0;
          setPorcentajePorHora(`${porcentajeHora}%`);
          setMermaHora(mermasHoraCalc);
          setProduccionHora(produccionHoraCalc);
        } else {
          setPorcentajePorHora('Sin datos');
        }
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
  useEffect(() => {
    // Se llama inicialmente fetchData para obtener la información
    fetchData();
    // Se establece un intervalo cada 60 segundos para refrescar los datos,
    // así se actualiza la jornada en cuanto llegue a las 22:00.
    const intervalo = setInterval(() => {
      fetchData();
    }, 60000);
    return () => clearInterval(intervalo);
  }, []);
  return (
    <>
      <div className="mt-6 md:mt-2">
        <Heading title="Mermas por hora" />
      </div>
      <Actualizacion />
      <div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Card informativa */}
          <div className="md:col-span-5">
            <div className="bg-white p-4 rounded shadow-md h-full">
              <h2 className="text-xl font-semibold text-center mb-4 text-gray-500 uppercase">
                Información de Mermas
              </h2>
              <div className="grid grid-cols-1 gap-4 mt-12">
                <div className="bg-gray-100 p-3 rounded-lg text-center">
                  <p className="text-xs md:text-sm font-medium text-gray-600 uppercase">
                    Último registro
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-cyan-600">
                    {ultimoRegistroIntervalo}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-100 p-3 rounded-lg text-center">
                  <p className="text-xs md:text-sm font-medium text-gray-600 uppercase">
                    Piezas por hora
                  </p>
                  <p className="text-xl md:text-2xl font-semibold text-red-600">
                    {piezasPorHora}
                  </p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg text-center">
                  <p className="text-xs md:text-sm font-medium text-gray-600 uppercase">
                    Piezas por día
                  </p>
                  <p className="text-xl md:text-2xl font-semibold text-red-600">
                    {piezasPorDia}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <div className="bg-gray-100 p-3 rounded-lg text-center">
                    <p className="text-xs md:text-sm font-medium text-gray-600 uppercase">
                      % por hora
                    </p>
                    <p className="text-xl md:text-2xl font-semibold text-red-600">
                      {porcentajePorHora}
                    </p>
                  </div>
                  <div className="mt-1 text-center text-xs text-gray-500">
                    (% por hora = ({mermaHora !== null ? mermaHora : '-' } / {produccionHora !== null ? produccionHora : '-'}) * 100 = {porcentajePorHora})
                  </div>
                </div>
                <div>
                  <div className="bg-gray-100 p-3 rounded-lg text-center">
                    <p className="text-xs md:text-sm font-medium text-gray-600 uppercase">
                      % acumulado del día
                    </p>
                    <p className="text-xl md:text-2xl font-semibold text-red-600">
                      {porcentajeAcumuladoDia}
                    </p>
                  </div>
                  <div className="mt-1 text-center text-xs text-gray-500">
                    (% acumulado = ({typeof piezasPorDia === 'number' ? piezasPorDia : '-' } / {totalProduccionDia !== null ? totalProduccionDia : '-'}) * 100 = {porcentajeAcumuladoDia})
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Card con la gráfica */}
          <div className="md:col-span-7 mt-4 md:mt-0">
            <div className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-semibold text-gray-500 mb-2 text-center uppercase hidden md:block">
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