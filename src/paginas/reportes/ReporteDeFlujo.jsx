import React, { useState, useEffect } from "react";
import clienteAxios from "../../../config/clienteAxios";
import Heading from "../../components/others/Heading";
import Select from "react-select";
import TablaFlujoWip from "../../components/others/tables/TablaFlujoWip";

// Opciones para los selects
const opcionesAnios = [
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
  { value: "2023", label: "2023" },
];
const opcionesMeses = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];
const opcionesDias = Array.from({ length: 31 }, (_, i) => {
  const dia = (i + 1).toString().padStart(2, "0");
  return { value: dia, label: dia };
});

// Estilos personalizados para react-select
const customStyles = {
  control: (provided) => ({
    ...provided,
    borderColor: "#D1D5DB",
    boxShadow: "none",
    "&:hover": { borderColor: "#9CA3AF" },
    borderRadius: "0.375rem",
    minHeight: "2.7rem",
    minWidth: "8.5rem",
    fontSize: "1rem",
    paddingLeft: "0.25rem",
    paddingRight: "0.25rem",
  }),
  menu: (provided) => ({ ...provided, zIndex: 9999 }),
};

const getOption = (opciones, valor) =>
  opciones.find((opt) => opt.value === valor);

const ReporteDeFlujo = () => {
  const [registros, setRegistros] = useState([]);

  // Calcular fechas por defecto
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);

  // Formatear fechas a string con ceros a la izquierda
  const yyyyHoy = hoy.getFullYear().toString();
  const mmHoy = (hoy.getMonth() + 1).toString().padStart(2, "0");
  const ddHoy = hoy.getDate().toString().padStart(2, "0");
  const yyyyAyer = ayer.getFullYear().toString();
  const mmAyer = (ayer.getMonth() + 1).toString().padStart(2, "0");
  const ddAyer = ayer.getDate().toString().padStart(2, "0");

  // Estados para selects de fecha inicio y fin
  const [anioInicio, setAnioInicio] = useState(
    getOption(opcionesAnios, yyyyAyer)
  );
  const [mesInicio, setMesInicio] = useState(getOption(opcionesMeses, mmAyer));
  const [diaInicio, setDiaInicio] = useState(getOption(opcionesDias, ddAyer));
  const [anioFin, setAnioFin] = useState(getOption(opcionesAnios, yyyyHoy));
  const [mesFin, setMesFin] = useState(getOption(opcionesMeses, mmHoy));
  const [diaFin, setDiaFin] = useState(getOption(opcionesDias, ddHoy));

  const consultar = async () => {
    try {
      const respuesta = await clienteAxios.get(
        `/reportes/reportes/wiptotal/rango/${anioInicio.value}/${mesInicio.value}/${diaInicio.value}/${anioFin.value}/${mesFin.value}/${diaFin.value}`
      );
      setRegistros(respuesta.data.registros);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  };

  useEffect(() => {
    consultar();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className="mt-6 md:mt-0">
        <Heading title="Reporte de Flujo WIP Total" />
      </div>
      <div className="mt-6 lg:mt-0 bg-gray-100 min-h-screen">
        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-8 items-center mb-6 justify-center">
          {/* Fecha inicio */}
          <div className="flex flex-col w-full md:w-auto md:flex-row gap-2 items-stretch md:items-center">
            <span className="mb-1 text-gray-700 font-semibold md:mb-0 md:mr-2 md:whitespace-nowrap">
              Fecha inicio
            </span>
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <div className="w-full sm:w-44">
                <Select
                  options={opcionesAnios}
                  value={anioInicio}
                  onChange={setAnioInicio}
                  placeholder="Año"
                  styles={customStyles}
                />
              </div>
              <div className="w-full sm:w-44">
                <Select
                  options={opcionesMeses}
                  value={mesInicio}
                  onChange={setMesInicio}
                  placeholder="Mes"
                  styles={customStyles}
                />
              </div>
              <div className="w-full sm:w-44">
                <Select
                  options={opcionesDias}
                  value={diaInicio}
                  onChange={setDiaInicio}
                  placeholder="Día"
                  styles={customStyles}
                />
              </div>
            </div>
          </div>
          {/* Fecha fin */}
          <div className="flex flex-col w-full md:w-auto md:flex-row gap-2 items-stretch md:items-center">
            <span className="mb-1 text-gray-700 font-semibold md:mb-0 md:mr-2 md:whitespace-nowrap">
              Fecha fin
            </span>
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <div className="w-full sm:w-44">
                <Select
                  options={opcionesAnios}
                  value={anioFin}
                  onChange={setAnioFin}
                  placeholder="Año"
                  styles={customStyles}
                />
              </div>
              <div className="w-full sm:w-44">
                <Select
                  options={opcionesMeses}
                  value={mesFin}
                  onChange={setMesFin}
                  placeholder="Mes"
                  styles={customStyles}
                />
              </div>
              <div className="w-full sm:w-44">
                <Select
                  options={opcionesDias}
                  value={diaFin}
                  onChange={setDiaFin}
                  placeholder="Día"
                  styles={customStyles}
                />
              </div>
            </div>
          </div>
          <div className="flex items-end h-full">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded mb-0 md:mb-0 md:ml-2"
              style={{ minHeight: "2.7rem" }}
              onClick={consultar}
            >
              Consultar
            </button>
          </div>
        </div>
        {/* Tabla separada */}
        <TablaFlujoWip registros={registros} />
        <div className="hidden lg:block mt-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">
            Notas importantes:{" "}
          </h3>
          <p className="text-gray-600">
            Este reporte muestra el flujo diario de recibidos, enviados y
            cancelados por cliente.
          </p>
        </div>
      </div>
    </>
  );
};

export default ReporteDeFlujo;