import React from 'react';
import { Link } from 'react-router-dom';
import { formatNumber } from '../../../helpers/formatNumber';
import { FaComment } from 'react-icons/fa';
import useBiseladoLA from '../../../../hooks/procesosLA/useBiseladoLA';
import ProcesosCard from '../../../components/others/cards/ProcesosCard';
const Biselado_Procesos_LA = () => {
  // Extraemos todo lo que necesitamos del context a través del hook
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
    handleEditarNotaTurno
  } = useBiseladoLA();
  // Armamos un objeto con la información de cada turno
  const turnos = {
    nocturno: { hits: hitsNocturno, meta: metaNocturno, comentario: notasTurnos.nocturno?.comentario },
    matutino: { hits: hitsMatutino, meta: metaMatutino, comentario: notasTurnos.matutino?.comentario },
    vespertino: { hits: hitsVespertino, meta: metaVespertino, comentario: notasTurnos.vespertino?.comentario },
  };
  return (
    <ProcesosCard
      title="biselado"
      linkPath="/totales_estacion_la?seccion=biselado"
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
export default Biselado_Procesos_LA;