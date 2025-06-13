import React, { useState } from "react";
import Select from "react-select";
import Heading from "../../components/others/Heading";
import TablaUnificadaFecha from "../../components/others/tables/finanzas/TablaUnificadaFecha";
// Función para generar opciones para los selects de año y día
const generarOpciones = (inicio, fin) => {
  const options = [];
  for (let i = inicio; i <= fin; i++) {
    options.push({ value: i, label: i.toString() });
  }
  return options;
};
// Opciones para el selector de años y días
const anioOptions = generarOpciones(2020, new Date().getFullYear());
const diaOptions = generarOpciones(1, 31);
// Arreglo con los nombres de los meses
const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
];
// Generar opciones para el select de meses utilizando el arreglo de nombres
const mesOptions = monthNames.map((nombre, index) => ({
  value: index + 1,
  label: nombre
}));
const customStyles = {
  control: (provided) => ({
    ...provided,
    borderColor: "#D1D5DB",
    boxShadow: "none",
    "&:hover": { borderColor: "#9CA3AF" },
    borderRadius: "0.375rem"
  }),
  menu: (provided) => ({ ...provided, zIndex: 9999 })
};
// Calcular fechas por defecto: fecha de fin = hoy, fecha de inicio = ayer
const hoy = new Date();
const ayer = new Date(hoy.getTime() - 86400000);
const HistorialFacturas = () => {
  const [startYear, setStartYear] = useState(ayer.getFullYear());
  const [startMonth, setStartMonth] = useState(ayer.getMonth() + 1);
  const [startDay, setStartDay] = useState(ayer.getDate());
  const [endYear, setEndYear] = useState(hoy.getFullYear());
  const [endMonth, setEndMonth] = useState(hoy.getMonth() + 1);
  const [endDay, setEndDay] = useState(hoy.getDate());
  // Función para construir la fecha en formato YYYY-MM-DD
  const formatFecha = (a, m, d) => {
    const pad = (num) => (num < 10 ? `0${num}` : num);
    return `${a}-${pad(m)}-${pad(d)}`;
  };
  const fechaInicio = formatFecha(startYear, startMonth, startDay);
  const fechaFin = formatFecha(endYear, endMonth, endDay);
  return (
    <>
      <div className="px-4 py-2">
        <Heading title="Historial de facturas" />
      </div>
      <div className="p-2 space-y-8">
        <div className="flex flex-col md:flex-row justify-center gap-6 mb-8">
          {/* Sección Fecha de Inicio */}
          <div className="p-4 flex-1 bg-white rounded shadow">
            <h3 className="text-center font-semibold text-gray-500 uppercase mb-4">
              Fecha Inicio
            </h3>
            <div className="flex flex-row gap-4">
              <div className="flex-1">
                <Select
                  options={anioOptions}
                  value={anioOptions.find((o) => o.value === startYear)}
                  onChange={(o) => setStartYear(o.value)}
                  placeholder="Año"
                  styles={customStyles}
                />
              </div>
              <div className="flex-1">
                <Select
                  options={mesOptions}
                  value={mesOptions.find((o) => o.value === startMonth)}
                  onChange={(o) => setStartMonth(o.value)}
                  placeholder="Mes"
                  styles={customStyles}
                />
              </div>
              <div className="flex-1">
                <Select
                  options={diaOptions}
                  value={diaOptions.find((o) => o.value === startDay)}
                  onChange={(o) => setStartDay(o.value)}
                  placeholder="Día"
                  styles={customStyles}
                />
              </div>
            </div>
          </div>
          {/* Sección Fecha de Fin */}
          <div className="p-4 flex-1 bg-white rounded shadow">
            <h3 className="text-center font-semibold text-gray-500 uppercase mb-4">
              Fecha Fin
            </h3>
            <div className="flex flex-row gap-4">
              <div className="flex-1">
                <Select
                  options={anioOptions}
                  value={anioOptions.find((o) => o.value === endYear)}
                  onChange={(o) => setEndYear(o.value)}
                  placeholder="Año"
                  styles={customStyles}
                />
              </div>
              <div className="flex-1">
                <Select
                  options={mesOptions}
                  value={mesOptions.find((o) => o.value === endMonth)}
                  onChange={(o) => setEndMonth(o.value)}
                  placeholder="Mes"
                  styles={customStyles}
                />
              </div>
              <div className="flex-1">
                <Select
                  options={diaOptions}
                  value={diaOptions.find((o) => o.value === endDay)}
                  onChange={(o) => setEndDay(o.value)}
                  placeholder="Día"
                  styles={customStyles}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Mostrar la tabla unificada pasando las fechas */}
        <TablaUnificadaFecha fechaInicio={fechaInicio} fechaFin={fechaFin} />
      </div>
    </>
  );
};
export default HistorialFacturas;