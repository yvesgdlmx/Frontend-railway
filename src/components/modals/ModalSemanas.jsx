import React from 'react'
// Funciones de ayuda para calcular las semanas ISO
// Calcula el "año ISO" de una fecha
const getISOWeekYear = (date) => {
  const d = new Date(date)
  // Si es domingo se lo trata como el día 7 para cálculos ISO
  const day = d.getDay() === 0 ? 7 : d.getDay()
  d.setDate(d.getDate() + 3 - day)
  return d.getFullYear()
}
// Formatea una fecha a formato "dd/mm/yyyy"
const formatShortDate = (date) => {
  const d = new Date(date)
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}
// Dada una fecha, retorna el lunes de esa semana (ISO: lunes a domingo)
const getStartOfISOWeek = (date) => {
  const d = new Date(date)
  const day = d.getDay() === 0 ? 7 : d.getDay()
  d.setDate(d.getDate() - (day - 1))
  // Se usa el constructor (año, mes [cero indexado], día) para evitar problemas de zona horaria
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}
// Calcula un arreglo con las semanas ISO de un año dado
// Cada entrada es un objeto { semana, rango } donde "rango" es "dd/mm/yyyy - dd/mm/yyyy"
const getISOWeeks = (year) => {
  const weeks = []
  // Para calcular la semana 1 se toma el 4 de enero (la semana que contiene el 4 pertenece al año ISO)
  const jan4 = new Date(year, 0, 4)
  let currentMonday = getStartOfISOWeek(jan4)
  let week = 1
  // Se generan semanas mientras el lunes pertenezca al año ISO indicado
  while (getISOWeekYear(currentMonday) === year) {
    // Calcula el domingo sumándole 6 días al lunes
    const currentSunday = new Date(currentMonday)
    currentSunday.setDate(currentMonday.getDate() + 6)
    weeks.push({
      semana: week,
      rango: `${formatShortDate(currentMonday)} - ${formatShortDate(currentSunday)}`
    })
    // Avanza una semana
    currentMonday.setDate(currentMonday.getDate() + 7)
    week++
  }
  return weeks
}
// Componente ModalSemanas que utiliza las funciones anteriores para generar y mostrar las semanas ISO
const ModalSemanas = ({ isOpen, onClose, year = 2025 }) => {
  if (!isOpen) return null
  // Se generan las semanas ISO para el año indicado (por defecto 2025)
  const semanasData = getISOWeeks(year)
  // Función para formatear una fecha extendida en español
  // Se espera que dateString venga en formato "dd/mm/yyyy"
  const formatDateFull = (dateString) => {
    // Convertir la cadena a números
    const [day, month, year] = dateString.split('/').map(Number)
    // Usar el constructor (año, mes [cero indexado], día)
    const date = new Date(year, month - 1, day)
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date)
  }
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Fondo semitransparente que cierra el modal al hacer click */}
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      {/* Contenido del modal */}
      <div className="bg-white p-8 rounded-lg shadow-xl relative z-10 max-w-6xl w-full">
        <h2 className="text-2xl font-bold mb-6 text-center uppercase text-gray-500">
          Semanas y Rangos de Fechas - {year}
        </h2>
        <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {semanasData.map((semana, index) => {
            // Se espera que semana.rango tenga el formato "dd/mm/yyyy - dd/mm/yyyy"
            const [start, end] = semana.rango.split(' - ')
            return (
              <div key={index} className="border p-4 rounded shadow-sm">
                <p className="font-medium text-lg mb-1 text-cyan-600">
                  Semana {semana.semana}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDateFull(start)} <br /> – <br /> {formatDateFull(end)}
                </p>
              </div>
            )
          })}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
export default ModalSemanas