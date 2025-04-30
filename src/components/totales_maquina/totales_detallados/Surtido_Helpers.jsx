import React from 'react';
import moment from 'moment-timezone';
import TablaGenerica from '../../others/TablaGenerica';
import Alerta from '../../others/alertas/Alerta';
// Función para agrupar registros por hora
export const groupByHour = (records, cyclicSort = false) => {
  const grouped = {};
  records.forEach((r) => {
    const time = moment(r.rawHour, "HH:mm:ss");
    const key = time.format("HH:mm");
    if (!grouped[key]) {
      const lowerBound = key;
      const upperBound = time.clone().add(1, "hour").format("HH:mm");
      grouped[key] = {
        rango: `${lowerBound} - ${upperBound}`,
        totalHits: 0,
        hits19: 0,
        hits20: 0,
      };
    }
    if (r.name.includes("19 LENS LOG-SF") || r.name.includes("19 LENS LOG")) {
      grouped[key].hits19 += Number(r.hits);
    } else if (r.name.includes("20 LENS LOG-FIN") || r.name.includes("20 LENS LOG")) {
      grouped[key].hits20 += Number(r.hits);
    }
    grouped[key].totalHits = grouped[key].hits19 + grouped[key].hits20;
  });
  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    let timeA = moment(a, "HH:mm");
    let timeB = moment(b, "HH:mm");
    if (cyclicSort) {
      if (timeA.isBefore(moment("06:30", "HH:mm"))) timeA.add(24, "hours");
      if (timeB.isBefore(moment("06:30", "HH:mm"))) timeB.add(24, "hours");
    }
    return timeA.diff(timeB);
  });
  return sortedKeys.map(key => {
    const lowerBoundMoment = moment(key, "HH:mm");
    if (cyclicSort && lowerBoundMoment.isBefore(moment("06:30", "HH:mm"))) {
      lowerBoundMoment.add(24, "hours");
    }
    return {
      sortKey: lowerBoundMoment,
      range: grouped[key].rango,
      hora: (
        <div>
          {grouped[key].rango}{' '}
          <span className="text-sm text-blue-400 ml-10">
            (Semiterminado: {grouped[key].hits19}, Terminado: {grouped[key].hits20})
          </span>
        </div>
      ),
      totalHits: grouped[key].totalHits,
      hits19: grouped[key].hits19,
      hits20: grouped[key].hits20
    };
  });
};
// Función que estiliza los registros individuales mostrando "hits / meta"
// Se pinta el valor de hits en verde si es mayor o igual a la meta, 
// en rojo en caso contrario y la meta se muestra en gris.
export const estilizarData = (data, metaTotal) => {
  return data.map(row => {
    const valor = row.totalHits;
    const claseColor = valor >= metaTotal ? "text-green-600" : "text-red-600";
    return {
      ...row,
      totalHits: (
        <span>
          <span className={claseColor}>{valor}</span>
          <span className="mx-1 text-gray-500">/</span>
          <span className="text-gray-500">{metaTotal}</span>
        </span>
      )
    };
  });
};
// Componente TurnoTable: renderiza la tabla para un turno dado utilizando los datos, meta y tiempos de corte
export const TurnoTable = ({ turno, data, metaTotal, start, end, currentTime, columns }) => {
  if (!start || !end) return null;
  if (data.length > 0) {
    const total = data.reduce((acc, row) => acc + row.totalHits, 0);
    const totalHits19 = data.reduce((acc, row) => acc + row.hits19, 0);
    const totalHits20 = data.reduce((acc, row) => acc + row.hits20, 0);
    // Estilizamos cada registro individual
    const dataEstilizada = metaTotal !== null ? estilizarData(data, metaTotal) : data;
    // Para la fila total se considera la suma de meta acumulada:
    // cada intervalo requiere la misma meta (metaTotal) y se multiplica por la cantidad de intervalos
    const totalMetaAcumulada = metaTotal !== null ? metaTotal * data.length : 0;
    // Si total es mayor o igual a totalMetaAcumulada se pinta verde, de lo contrario rojo
    const totalCell = metaTotal !== null ? (
      <span>
        <span className={total >= totalMetaAcumulada ? "text-green-600" : "text-red-600"}>{total}</span>
        <span className="mx-1 text-gray-500">/</span>
        <span className="text-gray-500">{totalMetaAcumulada}</span>
      </span>
    ) : total;
    const dataWithTotal = [
      ...dataEstilizada,
      {
        hora: (
          <div>
            Total{' '}
            <span className="text-sm text-blue-400 ml-10">
              (Semiterminado: {totalHits19}, Terminado: {totalHits20})
            </span>
          </div>
        ),
        totalHits: totalCell
      }
    ];
    return <TablaGenerica columns={columns} data={dataWithTotal} />;
  } else {
    let message = "";
    let type = "info";
    if (currentTime.isBefore(start)) {
      message = `Esperando datos del ${turno}.`;
    } else if (currentTime.isAfter(end)) {
      message = `No hay registros en el ${turno}.`;
      type = "error";
    } else {
      message = `Esperando datos del ${turno}.`;
    }
    return (
      <div className="flex justify-center items-center h-32">
        <Alerta message={message} type={type} />
      </div>
    );
  }
};