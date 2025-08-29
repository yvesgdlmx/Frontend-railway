import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import useTalladoEstacion from "../../../hooks/estacion/useTalladoEstacion";
import TablaEstacionDesktop from "../others/tables/estacion/TablaEstacionDesktop";
import CardEstacionMobile from "../others/cards/estacion/CardEstacionMobile";
const Totales_Tallado_Estacion = () => {
  const location = useLocation();
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
  } = useTalladoEstacion();
  // Lógica para el scroll según el hash de la URL
  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          window.scrollTo({
            top: element.offsetTop - 100,
            behavior: "smooth",
          });
        }
      }, 0);
    }
  }, [location]);
  return (
    <div className="max-w-screen-xl rounded-lg">
      <TablaEstacionDesktop
        // Propiedades generales que ya usas en ambos casos
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
        linkRoute="/totales_tallado_maquina"
        label="Bloq. tallado"
      />
      <CardEstacionMobile
        // Propiedades generales que ya usas en ambos casos
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
        linkRoute="/totales_tallado_maquina"
        label="Bloq. tallado"
      />
    </div>
  );
};
export default Totales_Tallado_Estacion;