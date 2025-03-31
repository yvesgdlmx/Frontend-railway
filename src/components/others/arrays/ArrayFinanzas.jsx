// Función para formatear una fecha en formato dd/mm/yyyy
function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  // Función que retorna el primer lunes del año dado
  function getFirstMonday(year) {
    const date = new Date(year, 0, 1);
    // Si ya es lunes no se entra en el ciclo
    while (date.getDay() !== 1) {
      date.setDate(date.getDate() + 1);
    }
    return date;
  }
  // Función para generar los rangos de semanas para un año dado.
  // Cada semana se define de lunes a domingo.
  export function getWeekRanges(year) {
    const weeks = [];
    let current = getFirstMonday(year);
    let weekNumber = 1;
    
    // Mientras el lunes de cada semana pertenezca al año indicado
    while (current.getFullYear() === year) {
      const weekStart = new Date(current);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      weeks.push({
        semana: weekNumber,
        rango: `${formatDate(weekStart)} - ${formatDate(weekEnd)}`,
      });
      
      weekNumber++;
      current.setDate(current.getDate() + 7);
    }
    return weeks;
  }
  // Generamos las semanas para el año 2023 (puedes adaptarlo o parametrizarlo)
  const weekRanges2023 = getWeekRanges(2025);
  // Opciones para el select de semanas. Se generan a partir de los rangos.
  export const optionsWeek = weekRanges2023.map(w => ({
    value: w.semana,
    label: `Semana ${w.semana}`,
  }));
  // Opciones fijas para los años. Puedes extenderlas según tus necesidades.
  export const optionsYear = [
    { value: 2023, label: '2023' },
    { value: 2024, label: '2024' },
    { value: 2025, label: '2025' }
  ];
  // Exportamos también el arreglo con la data completa de semanas
  export const dataSemanas = weekRanges2023;
  