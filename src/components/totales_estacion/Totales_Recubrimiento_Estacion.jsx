import React, { useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import useRecubrimientoEstacion from "../../../hooks/estacion/useRecubrimientoEstacion";
import TablaEstacionDesktop from "../others/tables/estacion/TablaEstacionDesktop";
import CardEstacionMobile from "../others/cards/estacion/CardEstacionMobile";
const Totales_Recubrimiento_Estacion = () => {
  const location = useLocation();
  const recubrimientoRef = useRef(null);
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
  } = useRecubrimientoEstacion();
  // Efecto de scroll al detectar el hash "#recubrimiento"
  useEffect(() => {
    if (location.hash === "#recubrimiento" && recubrimientoRef.current) {
      setTimeout(() => {
        const yOffset = -90;
        const element = recubrimientoRef.current;
        const y =
          element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }, 100);
    }
  }, [location]);
  return (
    <div className="max-w-screen-xl rounded-lg">
      {/* Versión Desktop */}
      <div className="hidden lg:block" ref={recubrimientoRef}>
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
          linkRoute="/totales_recubrimiento_maquina"
          label="Recubrimiento"
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
          linkRoute="/totales_recubrimiento_maquina"
          label="Recubrimiento"
        />
      </div>
    </div>
  );
};
export default Totales_Recubrimiento_Estacion;