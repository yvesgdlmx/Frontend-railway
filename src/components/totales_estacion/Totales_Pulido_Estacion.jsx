import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import usePulidoEstacion from "../../../hooks/estacion/usePulidoEstacion";
import TablaEstacionDesktop from "../others/tables/estacion/TablaEstacionDesktop";
import CardEstacionMobile from "../others/cards/estacion/CardEstacionMobile";
const Totales_Pulido_Estacion = () => {
  const location = useLocation();
  const {
    pulidoRef,
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
  } = usePulidoEstacion();
  // Efecto para el scroll según el hash de la URL
  useEffect(() => {
    if (location.hash === "#pulido" && pulidoRef.current) {
      setTimeout(() => {
        const yOffset = -90;
        const element = pulidoRef.current;
        const y =
          element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }, 100);
    }
  }, [location, pulidoRef]);
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
        linkRoute="/totales_pulido_maquina"
        label="Pulido"
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
        linkRoute="/totales_pulido_maquina"
        label="Pulido"
      />
    </div>
  );
};
export default Totales_Pulido_Estacion;