export const mergeRegistros = (arrays) => {
  const joinByFecha = {};
  arrays.forEach((dataArray) => {
    dataArray.forEach((record) => {
      const key = record.fecha;
      if (!joinByFecha[key]) {
        joinByFecha[key] = { fecha: key, semana: record.semana, ...record };
      } else {
        Object.keys(record).forEach((prop) => {
          if (prop !== "fecha" && prop !== "semana") {
            if (typeof record[prop] === "string") {
              joinByFecha[key][prop] = record[prop];
            } else {
              joinByFecha[key][prop] =
                (joinByFecha[key][prop] || 0) + record[prop];
            }
          }
        });
      }
    });
  });
  // Se ordena usando localeCompare para fechas (asumiendo formato YYYY-MM-DD)
  return Object.values(joinByFecha).sort((a, b) => a.fecha.localeCompare(b.fecha));
};