import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import useTerminadoEstacion from "../../../hooks/estacion/useTerminadoEstacion";
import TablaEstacionDesktop from "../others/tables/estacion/TablaEstacionDesktop";
import CardEstacionMobile from "../others/cards/estacion/CardEstacionMobile";
const Totales_Terminado_Estacion = () => {
  const location = useLocation();
  const {
    terminadoRef,
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
  } = useTerminadoEstacion();
  useEffect(() => {
    if (location.hash === "#terminado" && terminadoRef.current) {
      setTimeout(() => {
        const yOffset = -90;
        const element = terminadoRef.current;
        const y =
          element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }, 100);
    }
  }, [location, terminadoRef]);
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
        linkRoute="/totales_terminado_maquina"
        label="Bloq. Terminado"
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
        linkRoute="/totales_terminado_maquina"
        label="Bloq. Terminado"
      />
    </div>
  );
};
export default Totales_Terminado_Estacion;