import React, { useState, useEffect } from "react";
import Select from "react-select";
import { CalendarIcon } from "@heroicons/react/24/outline";
import TablaUnificada from "../../components/others/tables/finanzas/TablaUnificada";
import ModalSemanas from "../../components/modals/ModalSemanas";
import { optionsYear, optionsWeek, dataSemanas } from "../../components/others/arrays/ArrayFinanzas";
import Heading from "../../components/others/Heading";
const Datos = () => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: "#D1D5DB",
      boxShadow: "none",
      "&:hover": { borderColor: "#9CA3AF" },
      borderRadius: "0.375rem",
    }),
    menu: (provided) => ({ ...provided, zIndex: 9999 }),
  };
  // Función para obtener el número de semana
  const getWeekNumber = (d) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  };
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const currentWeek = getWeekNumber(new Date());
    const defaultYearOption = optionsYear.find((option) => option.value === currentYear);
    const defaultWeekOption = optionsWeek.find((option) => Number(option.value) === currentWeek);
    if (defaultYearOption) setSelectedYear(defaultYearOption);
    if (defaultWeekOption) setSelectedWeek(defaultWeekOption);
  }, []);
  return (
    <>
      <div className="px-4 py-2">
       <Heading title={'Reporte de facturación'}/>
      </div>
      <div className="p-2 space-y-10">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
          <div className="w-64">
            <Select
              options={optionsYear}
              value={selectedYear}
              onChange={(option) => setSelectedYear(option)}
              placeholder="Selecciona un año"
              styles={customStyles}
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center space-x-2">
            <div className="w-64">
              <Select
                options={optionsWeek}
                value={selectedWeek}
                onChange={(option) => setSelectedWeek(option)}
                placeholder="Selecciona una semana"
                styles={customStyles}
              />
            </div>
            <button
              className="flex items-center mt-3 sm:mt-0 px-4 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors shadow-md"
              onClick={() => setIsModalOpen(true)}
            >
              <CalendarIcon className="h-5 w-5" />
              <span className="ml-2">Ver rangos</span>
            </button>
          </div>
        </div>
        {selectedYear && selectedWeek && (
          <TablaUnificada anio={selectedYear.value} semana={selectedWeek.value} />
        )}
      </div>
      <ModalSemanas
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        semanasData={dataSemanas}
      />
    </>
  );
};
export default Datos;