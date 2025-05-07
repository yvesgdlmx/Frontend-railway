// chartConfig.js
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
// Registro global, se ejecuta solo una vez al importar este archivo
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
// Puedes exportar Chart si lo necesitas en otros archivos
export default Chart;