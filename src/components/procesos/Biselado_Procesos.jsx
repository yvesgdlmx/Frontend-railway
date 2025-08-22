import React from 'react';
import useBiselado from '../../../hooks/procesos/useBiselado';
import ProcesosCard from '../others/cards/ProcesosCard';
const BiseladoProcesos = () => {
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
  } = useBiselado();
  const turnos = {
    nocturno: { hits: hitsNocturno, meta: metaNocturno, comentario: notasTurnos.nocturno?.comentario },
    matutino: { hits: hitsMatutino, meta: metaMatutino, comentario: notasTurnos.matutino?.comentario },
    vespertino: { hits: hitsVespertino, meta: metaVespertino, comentario: notasTurnos.vespertino?.comentario },
  };
  return (
    <ProcesosCard
      title="Biselado"
      linkPath="/totales_estacion?seccion=biselado"
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
export default BiseladoProcesos;