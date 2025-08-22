import React from 'react';
import useGenerado from '../../../hooks/procesos/useGenerado';
import ProcesosCard from '../others/cards/ProcesosCard';
const GeneradoProcesos = () => {
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
  } = useGenerado();
  const turnos = {
    nocturno: { hits: hitsNocturno, meta: metaNocturno, comentario: notasTurnos.nocturno?.comentario },
    matutino: { hits: hitsMatutino, meta: metaMatutino, comentario: notasTurnos.matutino?.comentario },
    vespertino: { hits: hitsVespertino, meta: metaVespertino, comentario: notasTurnos.vespertino?.comentario },
  };
  return (
    <ProcesosCard
      title="Generadores"
      linkPath="/totales_estacion?seccion=generado"
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
export default GeneradoProcesos;