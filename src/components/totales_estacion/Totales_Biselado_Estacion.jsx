import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import useBiseladoEstacion from "../../../hooks/estacion/useBiseladoEstacion";
import TablaEstacionDesktop from "../others/tables/estacion/TablaEstacionDesktop";
import CardEstacionMobile from "../others/cards/estacion/CardEstacionMobile";

const Totales_Biselado_Estacion = () => {
  const location = useLocation();
  const {
    biseladoRef,
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
  } = useBiseladoEstacion();
  // Efecto de scroll si el hash de la URL es "#biselado"
  useEffect(() => {
    if (location.hash === "#biselado" && biseladoRef.current) {
      setTimeout(() => {
        const yOffset = -100;
        const element = biseladoRef.current;
        const y =
          element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }, 100);
    }
  }, [location, biseladoRef]);
  return (
    <div className="max-w-screen-xl rounded-lg">
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
        linkRoute="/totales_biselado_maquina"
        label="Biselado"
      />
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
        linkRoute="/totales_biselado_maquina"
        label="Biselado"
      />
    </div>
  );
};
export default Totales_Biselado_Estacion;