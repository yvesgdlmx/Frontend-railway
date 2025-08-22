import React from 'react';
import usePulido from '../../../hooks/procesos/usePulido';
import ProcesosCard from '../others/cards/ProcesosCard';
const PulidoProcesos = () => {
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
  } = usePulido();
  const turnos = {
    nocturno: { hits: hitsNocturno, meta: metaNocturno, comentario: notasTurnos.nocturno?.comentario },
    matutino: { hits: hitsMatutino, meta: metaMatutino, comentario: notasTurnos.matutino?.comentario },
    vespertino: { hits: hitsVespertino, meta: metaVespertino, comentario: notasTurnos.vespertino?.comentario },
  };
  return (
    <ProcesosCard
      title="Pulido"
      linkPath="/totales_estacion?seccion=pulido"
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
export default PulidoProcesos;