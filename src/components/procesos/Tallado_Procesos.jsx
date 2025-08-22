import React from 'react';
import useTallado from '../../../hooks/procesos/useTallado';
import ProcesosCard from '../others/cards/ProcesosCard';
const TalladoProcesos = () => {
  const {
    totalHits,
    ultimaHora,
    siguienteHora,
    meta,
    hitsNocturno,
    hitsMatutino,
    hitsVespertino,
    metaNocturno,
    metaMatutino,
    metaVespertino,
    notasTurnos,
    turnoActivo,
    editingTurnoNota,
    toggleNotaTurno,
    handleGuardarNotaTurno,
    handleEditarNotaTurno,
    setEditingTurnoNota,
  } = useTallado();
  const turnos = {
    nocturno: { hits: hitsNocturno, meta: metaNocturno, comentario: notasTurnos.nocturno?.comentario },
    matutino: { hits: hitsMatutino, meta: metaMatutino, comentario: notasTurnos.matutino?.comentario },
    vespertino: { hits: hitsVespertino, meta: metaVespertino, comentario: notasTurnos.vespertino?.comentario },
  };
  return (
    <ProcesosCard
      title="Bloqueo de tallado"
      linkPath="/totales_estacion?seccion=tallado"
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
export default TalladoProcesos;