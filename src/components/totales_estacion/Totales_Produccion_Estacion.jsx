import React, { useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import moment from "moment-timezone";
import useProduccionEstacion from "../../../hooks/estacion/useProduccionEstacion";
import TablaEstacionDesktop from "../others/tables/estacion/TablaEstacionDesktop";
import CardEstacionMobile from "../others/cards/estacion/CardEstacionMobile";
moment.tz.setDefault("America/Mexico_City");
const Totales_Produccion_Estacion = () => {
  const location = useLocation();
  const produccionRef = useRef(null);
  const {
    columnas,
    totalesPorTurno,
    metasPorHora,
    metasTotalesPorTurno,
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
    getMetaParaHora,
    getClassName,
    inicioJornada,
  } = useProduccionEstacion();
  // Lógica para scroll cuando la URL trae hash #produccion
  useEffect(() => {
    if (location.hash === "#produccion" && produccionRef.current) {
      setTimeout(() => {
        const yOffset = -5;
        const element = produccionRef.current;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }, 100);
    }
  }, [location]);
  return (
    <div className="max-w-screen-xl rounded-lg">
      {/* Versión para pantallas grandes */}
      <div className="hidden lg:block" ref={produccionRef}>
        <TablaEstacionDesktop
          columnas={columnas}
          totalesPorTurno={totalesPorTurno}
          metasPorHora={metasPorHora}
          metasTotalesPorTurno={metasTotalesPorTurno}
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
          getMetaParaHora={getMetaParaHora}
          getClassName={getClassName}
          inicioJornada={inicioJornada}
          label="Producción"
          linkRoute="/totales_produccion_maquina"
        />
      </div>
      {/* Versión para pantallas pequeñas */}
      <div className="block lg:hidden mt-4">
        <CardEstacionMobile
          columnas={columnas}
          totalesPorTurno={totalesPorTurno}
          metasPorHora={metasPorHora}
          metasTotalesPorTurno={metasTotalesPorTurno}
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
          getMetaParaHora={getMetaParaHora}
          getClassName={getClassName}
          inicioJornada={inicioJornada}
          label="Producción"
          linkRoute="/totales_produccion_maquina"
        />
      </div>
    </div>
  );
};
export default Totales_Produccion_Estacion;