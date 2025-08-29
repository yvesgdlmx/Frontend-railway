import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import useAREstacion from "../../../hooks/estacion/useAREstacion";
import TablaEstacionDesktop from "../others/tables/estacion/TablaEstacionDesktop";
import CardEstacionMobile from "../others/cards/estacion/CardEstacionMobile";
const Totales_AR_Estacion = () => {
  const location = useLocation();
  const arRef = useRef(null);
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
  } = useAREstacion();
  // Efecto de scroll si el hash es "#ar"
  useEffect(() => {
    if (location.hash === "#ar" && arRef.current) {
      setTimeout(() => {
        const yOffset = -90;
        const element = arRef.current;
        const y =
          element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }, 100);
    }
  }, [location]);
  return (
    <div className="max-w-screen-xl rounded-lg">
      {/* Versión Desktop */}
      <div className="hidden lg:block relative" ref={arRef}>
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
          linkRoute="/totales_ar_maquina"
          label="AR"
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
          linkRoute="/totales_ar_maquina"
          label="AR"
        />
      </div>
    </div>
  );
};
export default Totales_AR_Estacion;