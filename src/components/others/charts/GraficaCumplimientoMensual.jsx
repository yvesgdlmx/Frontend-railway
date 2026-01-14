import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { InformationCircleIcon } from '@heroicons/react/20/solid';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const GraficaCumplimientoMensual = ({ datos }) => {
  const [vistaActual, setVistaActual] = useState('SF'); // 'SF' o 'F'
  
  const labels = datos.map(mes => mes.nombreMes);
  
  // Configuración para gráfica SF
  const chartDataSF = {
    labels: labels,
    datasets: [
      {
        label: 'Real SF',
        data: datos.map(mes => mes.realSF),
        fill: false,
        borderColor: '#10b981', // green-500
        backgroundColor: '#10b981',
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Meta SF',
        data: datos.map(mes => mes.metaSF),
        fill: false,
        borderColor: '#ef4444', // red-500
        backgroundColor: '#ef4444',
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderDash: [5, 5], // Línea punteada
      },
    ],
  };

  // Configuración para gráfica F
  const chartDataF = {
    labels: labels,
    datasets: [
      {
        label: 'Real F',
        data: datos.map(mes => mes.realF),
        fill: false,
        borderColor: '#a855f7', // purple-500
        backgroundColor: '#a855f7',
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Meta F',
        data: datos.map(mes => mes.metaF),
        fill: false,
        borderColor: '#ef4444', // red-500
        backgroundColor: '#ef4444',
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderDash: [5, 5], // Línea punteada
      },
    ],
  };

  // Seleccionar datos según la vista actual
  const chartData = vistaActual === 'SF' ? chartDataSF : chartDataF;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#1e293b',
          font: { 
            weight: 'bold',
            size: 12
          },
        },
      },
      tooltip: {
        backgroundColor: '#0d9488',
        titleColor: '#fff',
        bodyColor: '#fff',
        titleFont: { weight: 'bold' },
        bodyFont: { weight: 'normal' },
        padding: 10,
        callbacks: {
          label: function(context) {
            const mesIndex = context.dataIndex;
            const mes = datos[mesIndex];
            const label = context.dataset.label;
            const value = context.parsed.y.toLocaleString('es-MX');
            
            return `${label}: ${value}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#e2e8f0' },
        ticks: { 
          color: '#1e293b',
          callback: function(value) {
            return value.toLocaleString('es-MX');
          }
        },
        title: {
          display: true,
          text: 'Cantidad',
          color: '#9b9b9b',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      x: {
        grid: { color: '#e2e8f0' },
        ticks: { color: '#1e293b' },
        title: {
          display: true,
          text: 'Meses',
          color: '#9b9b9b',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
    },
  };

  const AvisoInformativo = () => (
    <div className="bg-blue-50 border border-blue-200 p-3 rounded-md flex items-start mt-6">
      <InformationCircleIcon className="h-6 w-6 text-blue-500 flex-shrink-0" />
      <p className="ml-3 text-xs md:text-sm text-blue-700">
        {vistaActual === 'SF' 
          ? 'La gráfica muestra la evolución mensual de trabajos Semi-Finished (SF). La línea verde representa los trabajos reales y la línea roja punteada representa la meta establecida.'
          : 'La gráfica muestra la evolución mensual de trabajos Finished (F). La línea morada representa los trabajos reales y la línea roja punteada representa la meta establecida.'
        }
      </p>
    </div>
  );

  return (
    <div className="p-4">
      {/* Switch para cambiar entre SF y F */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-lg border border-gray-300 bg-gray-100 p-1">
          <button
            onClick={() => setVistaActual('SF')}
            className={`px-6 py-2 rounded-md font-semibold transition-all ${
              vistaActual === 'SF'
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Semi-Finished (SF)
          </button>
          <button
            onClick={() => setVistaActual('F')}
            className={`px-6 py-2 rounded-md font-semibold transition-all ${
              vistaActual === 'F'
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Finished (F)
          </button>
        </div>
      </div>

      <div className="h-[400px]">
        <Line data={chartData} options={options} />
      </div>
      <AvisoInformativo />
    </div>
  );
};

export default GraficaCumplimientoMensual;