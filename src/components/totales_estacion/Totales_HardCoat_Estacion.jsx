import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import useHardcoatEstacion from "../../../hooks/estacion/useHarcoatEstacion";
// Uso de los mismos componentes reutilizables que ya tienes para otras secciones
import TablaEstacionDesktop from "../others/tables/estacion/TablaEstacionDesktop";
import CardEstacionMobile from "../others/cards/estacion/CardEstacionMobile";
const Totales_HardCoat_Estacion = () => {
  const location = useLocation();
  const hardcoatRef = useRef(null);
  const {
    columnas,
    totalesPorTurno,
    notas,
    notaActiva,
    editingNota,
    setEditingNota,
    toggleNota,
    handleGuardarNota,
    handleEditarNota,
    toggleNotaTurno,
    notasTurnos,
    turnoActivo,
    editingTurnoNota,
    setEditingTurnoNota,
    handleGuardarNotaTurno,
    handleEditarNotaTurno,
  } = useHardcoatEstacion();
  // Efecto de scroll si la URL trae el hash "#hardcoat"
  useEffect(() => {
    if (location.hash === "#hardcoat" && hardcoatRef.current) {
      setTimeout(() => {
        const yOffset = -90;
        const element = hardcoatRef.current;
        const y =
          element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }, 100);
    }
  }, [location]);
  return (
    <div className="max-w-screen-xl rounded-lg">
      {/* Versión Desktop: usando el contenedor referenciado */}
      <div className="hidden lg:block" ref={hardcoatRef}>
        <TablaEstacionDesktop
          columnas={columnas}
          totalesPorTurno={totalesPorTurno}
          notas={notas}
          notaActiva={notaActiva}
          editingNota={editingNota}
          setEditingNota={setEditingNota}
          toggleNota={toggleNota}
          handleGuardarNota={handleGuardarNota}
          handleEditarNota={handleEditarNota}
          toggleNotaTurno={toggleNotaTurno}
          notasTurnos={notasTurnos}
          turnoActivo={turnoActivo}
          editingTurnoNota={editingTurnoNota}
          setEditingTurnoNota={setEditingTurnoNota}
          handleGuardarNotaTurno={handleGuardarNotaTurno}
          handleEditarNotaTurno={handleEditarNotaTurno}
          linkRoute="/totales_hardcoat_maquina"
          label="Hard Coat"
        />
      </div>
      {/* Versión Mobile */}
      <div className="block lg:hidden mt-4">
        <CardEstacionMobile
          columnas={columnas}
          totalesPorTurno={totalesPorTurno}
          notas={notas}
          notaActiva={notaActiva}
          editingNota={editingNota}
          setEditingNota={setEditingNota}
          toggleNota={toggleNota}
          handleGuardarNota={handleGuardarNota}
          handleEditarNota={handleEditarNota}
          toggleNotaTurno={toggleNotaTurno}
          notasTurnos={notasTurnos}
          turnoActivo={turnoActivo}
          editingTurnoNota={editingTurnoNota}
          setEditingTurnoNota={setEditingTurnoNota}
          handleGuardarNotaTurno={handleGuardarNotaTurno}
          handleEditarNotaTurno={handleEditarNotaTurno}
          linkRoute="/totales_hardcoat_maquina"
          label="Hard Coat"
        />
      </div>
    </div>
  );
};
export default Totales_HardCoat_Estacion;