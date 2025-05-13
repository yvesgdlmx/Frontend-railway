import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import clienteAxios from '../../../../config/clienteAxios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { InformationCircleIcon } from '@heroicons/react/20/solid';
// Registrar los componentes necesarios de Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);
// Función auxiliar para obtener el intervalo para el tooltip o el resumen en el card.
// Ahora: para cualquier hora se muestra el rango hacia adelante (por ejemplo, "14:30 - 15:30")
const obtenerIntervaloHover = (horaStr) => {
  const partes = horaStr.split(':');
  const hora = parseInt(partes[0], 10);
  const minutos = partes[1];
  const siguienteHora = (hora + 1) % 24;
  return `${hora.toString().padStart(2, '0')}:${minutos} - ${siguienteHora.toString().padStart(2, '0')}:${minutos}`;
};
// Función para obtener la fecha en formato "YYYY-MM-DD"
const obtenerFechaLocal = (fecha) => {
  const anio = fecha.getFullYear();
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const dia = fecha.getDate().toString().padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};
// Función para normalizar horas: remueve segundos si existen (de "HH:MM:SS" a "HH:MM")
const normalizarHora = (horaStr) => {
  return horaStr.length > 5 ? horaStr.substring(0, 5) : horaStr;
};
const GraficaMermasPorHora = () => {
  // Estado para la gráfica (mermas)
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Mermas',
        data: [],
        fill: false,
        borderColor: '#0891B2', // Color cyan-600 de TailwindCSS
        tension: 0.1,
      },
    ],
  });
  // Estado para guardar los registros filtrados (para el resumen en card) de mermas
  const [registrosTurno, setRegistrosTurno] = useState([]);
  // Estado para guardar el mapeo de producción por hora (en formato "HH:MM")
  const [produccionMap, setProduccionMap] = useState({});
  // Estado para determinar si es dispositivo móvil (ancho menor a 768px)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  // Listener para actualizar el modo mobile al cambiar el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        // Obtener los registros de mermas
        const respuestaMermas = await clienteAxios.get('/mermas/conteo_de_mermas');
        const registrosMermas = respuestaMermas.data.registros;
        // Determinar la hora actual y establecer el turno (rango entre 22:00 de un día y 21:59 del siguiente)
        const ahora = new Date();
        const horaActual = ahora.getHours();
        let fechaObjetivo, fechaAnterior;
        if (horaActual < 22) {
          fechaObjetivo = obtenerFechaLocal(ahora);
          const ayer = new Date(ahora);
          ayer.setDate(ahora.getDate() - 1);
          fechaAnterior = obtenerFechaLocal(ayer);
        } else {
          fechaObjetivo = obtenerFechaLocal(new Date(ahora.getTime() + 24 * 60 * 60 * 1000));
          fechaAnterior = obtenerFechaLocal(ahora);
        }
        // Filtrar registros de mermas según turno:
        // • Registro del día "fechaAnterior" con hora >= "22:00:00"
        // • Registro del día "fechaObjetivo" con hora < "22:00:00"
        const registrosFiltrados = registrosMermas.filter(reg => {
          if (reg.fecha === fechaAnterior && reg.hora >= "22:00:00") return true;
          if (reg.fecha === fechaObjetivo && reg.hora < "22:00:00") return true;
          return false;
        });
        // Ordenar cronológicamente los registros de mermas
        registrosFiltrados.sort((a, b) => {
          const fechaHoraA = new Date(`${a.fecha}T${a.hora}`);
          const fechaHoraB = new Date(`${b.fecha}T${b.hora}`);
          return fechaHoraA - fechaHoraB;
        });
        console.log("Registros de mermas filtrados y ordenados:", registrosFiltrados);
        setRegistrosTurno(registrosFiltrados);
        // Construir arrays para la gráfica de mermas (etiquetas y datos)
        const labels = registrosFiltrados.map(reg => reg.hora);
        const datosTotales = registrosFiltrados.map(reg => Number(reg.total));
        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Mermas',
              data: datosTotales,
              fill: false,
              borderColor: '#0891B2', // Color cyan-600
              tension: 0.1,
              pointRadius: 4,
              pointHoverRadius: 5,
            },
          ],
        });
        // Obtener los registros de producción
        const respuestaProduccion = await clienteAxios.get('/mermas/produccion');
        const registrosProduccion = respuestaProduccion.data.registros;
        // Filtrar registros de producción con la misma lógica de turno
        const registrosProdTurno = registrosProduccion.filter(prod => {
          if (prod.fecha === fechaAnterior && prod.hour >= "22:00:00") return true;
          if (prod.fecha === fechaObjetivo && prod.hour < "22:00:00") return true;
          return false;
        });
        // Construir un mapeo: hora (normalizada a "HH:MM") => producción (hits)
        const mapProd = {};
        registrosProdTurno.forEach(prod => {
          const key = normalizarHora(prod.hour);
          if (mapProd[key]) {
            mapProd[key] += Number(prod.hits);
          } else {
            mapProd[key] = Number(prod.hits);
          }
        });
        setProduccionMap(mapProd);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };
    obtenerDatos();
  }, []);
  
  // Opciones para la gráfica en escritorio con tooltip personalizado
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#e2e8f0' },
        ticks: { color: '#1e293b' },
        title: {
          display: true,
          text: 'Cantidad',
          color: '#9b9b9b', // Ajusta el color según tus necesidades
          font: {
            size: 14, // Ajusta el tamaño de fuente si es necesario
            weight: 'bold'
          }
        }
      },
      x: {
        grid: { color: '#e2e8f0' },
        ticks: { color: '#1e293b' },
        title: {
          display: true,
          text: 'Horas',
          color: '#9b9b9b',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const hora = context.label;
            const horaFormateada = hora.length > 5 ? hora.substring(0, 5) : hora;
            const rango = obtenerIntervaloHover(horaFormateada);
            const produccion = produccionMap[horaFormateada] || 0;
            const merma = context.parsed.y;
            const porcentaje = produccion > 0 ? ((merma / produccion) * 100).toFixed(2) : "N/A";
            return `${rango} : ${merma}  -  % Merma: ${porcentaje}%`;
          },
        },
        backgroundColor: '#0d9488',
        titleColor: '#fff',
        bodyColor: '#fff',
        titleFont: { weight: 'bold' },
        bodyFont: { weight: 'normal' },
        padding: 10,
      },
      legend: {
        labels: {
          color: '#1e293b',
          font: { weight: 'bold' },
        },
      },
    },
  };
  // Aviso informativo
  const AvisoInformativo = () => (
    <div className="bg-blue-50 border border-blue-200 p-3 rounded-md flex items-start mt-6">
      <InformationCircleIcon className="h-6 w-6 text-blue-500 flex-shrink-0" />
      <p className="ml-3 text-xs md:text-sm text-blue-700">
        El registro de cada hora comprende un intervalo de tiempo; por ejemplo, 06:30 - 07:30.
      </p>
    </div>
  );
  // En dispositivos móviles se muestra un resumen en forma de card
  if (isMobile) {
    return (
      <div>
        <h2 className="text-center text-xl font-light text-sky-600 mb-4 uppercase">
          Resumen de Mermas por Hora
        </h2>
        {registrosTurno.length === 0 ? (
          <p className="text-center text-gray-600">No hay datos disponibles para este turno.</p>
        ) : (
          registrosTurno.map((reg, index) => {
            const horaFormateada = reg.hora.length > 5 ? reg.hora.substring(0, 5) : reg.hora;
            const rango = obtenerIntervaloHover(horaFormateada);
            const prod = produccionMap[horaFormateada] || 0;
            const merma = Number(reg.total);
            const porcentaje = prod > 0 ? ((merma / prod) * 100).toFixed(2) : "N/A";
            return (
              <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-3">
                <p className="text-gray-500 font-medium">
                  Rango: <span className="font-bold text-sky-600">{rango}</span>
                </p>
                <p className="text-gray-500 font-medium">
                  Total de Mermas: <span className="font-bold text-sky-600">{reg.total}</span>
                </p>
                <p className="text-gray-500 font-medium">
                  Producción: <span className="font-bold text-sky-600">{prod}</span>
                </p>
                <p className="text-gray-500 font-medium">
                  Porcentaje de Merma: <span className="font-bold text-sky-600">{porcentaje}%</span>
                </p>
              </div>
            );
          })
        )}
        {/* Aviso informativo en dispositivos móviles */}
        <AvisoInformativo />
      </div>
    );
  }
  // En pantallas grandes se muestra la gráfica completa
  return (
    <div className="p-4">
      <div className="h-[400px]">
        <Line data={chartData} options={options} />
      </div>
      {/* Aviso informativo para pantallas grandes */}
      <AvisoInformativo />
    </div>
  );
};
export default GraficaMermasPorHora;