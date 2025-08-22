import React from "react";
import useGeneradoLa from "../../../../hooks/procesosLA/useGeneradoLA";
import ProcesosCard from "../../../components/others/cards/ProcesosCard";
const Generado_Procesos_LA = () => {
  // Extraemos la lógica y los datos del context a través del hook personalizado
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
  } = useGeneradoLa();
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
      title="Generadores"
      linkPath="/totales_estacion_la?seccion=generado"
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
export default Generado_Procesos_LA;