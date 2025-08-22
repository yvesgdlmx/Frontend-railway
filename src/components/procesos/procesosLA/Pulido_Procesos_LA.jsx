import React from "react";
import usePulidoLA from "../../../../hooks/procesosLA/usePulidoLA";
import ProcesosCard from "../../../components/others/cards/ProcesosCard";
const Pulido_Procesos_LA = () => {
  // Extraemos la lógica y los datos del context a través del hook
  const {
    totalHits,
    ultimaHora,
    siguienteHora,
    meta,
    hitsMatutino,
    hitsVespertino,
    hitsNocturno,
    metaMatutino,
    metaVespertino,
    metaNocturno,
    notasTurnos,
    turnoActivo,
    editingTurnoNota,
    setEditingTurnoNota,
    toggleNotaTurno,
    handleGuardarNotaTurno,
    handleEditarNotaTurno,
  } = usePulidoLA();
  // Armamos un objeto con la información de cada turno
  const turnos = {
    nocturno: {
      hits: hitsNocturno,
      meta: metaNocturno,
      comentario: notasTurnos.nocturno?.comentario,
    },
    matutino: {
      hits: hitsMatutino,
      meta: metaMatutino,
      comentario: notasTurnos.matutino?.comentario,
    },
    vespertino: {
      hits: hitsVespertino,
      meta: metaVespertino,
      comentario: notasTurnos.vespertino?.comentario,
    },
  };
  return (
    <ProcesosCard
      title="Pulido"
      linkPath="/totales_estacion_la?seccion=pulido"
      ultimaHora={ultimaHora}
      siguienteHora={siguienteHora}
      totalHits={totalHits}
      meta={meta}
      turnos={turnos}
      toggleNotaTurno={toggleNotaTurno}
      turnoActivo={turnoActivo}
      editingTurnoNota={editingTurnoNota}
      setEditingTurnoNota={setEditingTurnoNota}
      handleGuardarNotaTurno={handleGuardarNotaTurno}
      handleEditarNotaTurno={handleEditarNotaTurno}
    />
  );
};
export default Pulido_Procesos_LA;