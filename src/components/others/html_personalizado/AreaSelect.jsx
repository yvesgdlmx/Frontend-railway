import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Select from "react-select";
const AreaSelect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sectionOptions = [
    { value: "totales_surtido_maquina", label: "Surtido" },
    { value: "totales_tallado_maquina", label: "Bloqueo de tallado" },
    { value: "totales_generado_maquina", label: "Generado" },
    { value: "totales_pulido_maquina", label: "Pulido" },
    { value: "totales_engraver_maquina", label: "Engraver" },
    { value: "totales_ar_maquina", label: "AR" },
    { value: "totales_hardcoat_maquina", label: "Hardcoat" },
    { value: "totales_recubrimiento_maquina", label: "Recubrimiento" },
    { value: "totales_desblocking_maquina", label: "Desbloqueo" },
    { value: "totales_terminado_maquina", label: "Terminado" },
    { value: "totales_biselado_maquina", label: "Biselado" },
    { value: "totales_produccion_maquina", label: "Producción" }
  ];
  const obtenerOpcionDesdeRuta = () => {
    // Se asume que la ruta es de la forma "/valor"
    const currentPath = location.pathname.replace("/", "");
    return sectionOptions.find((option) => option.value === currentPath) || sectionOptions[0];
  };
  const [selectedSection, setSelectedSection] = useState(obtenerOpcionDesdeRuta());
  const handleChange = (option) => {
    setSelectedSection(option);
    navigate(`/${option.value}`);
  };
  useEffect(() => {
    // Actualiza la opción cuando se cambia la URL para mantener la sincronización
    const opcionActual = obtenerOpcionDesdeRuta();
    setSelectedSection(opcionActual);
  }, [location.pathname]);
  // Estilos personalizados: se limita el ancho para que no abarque todo el espacio
  const customStyles = {
    control: (provided) => ({
      ...provided,
      border: "1px solid #ccc",
      borderRadius: "4px",
      minWidth: "200px",
      maxWidth: "250px"
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999
    })
  };
  return (
    <div className="flex items-center mb-4">
      <span className="mr-2 font-semibold text-gray-600">Sección:</span>
      <Select
        value={selectedSection}
        onChange={handleChange}
        options={sectionOptions}
        styles={customStyles}
      />
    </div>
  );
};
export default AreaSelect;