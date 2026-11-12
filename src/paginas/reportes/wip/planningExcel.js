const headers = ['Fecha', 'Llegada total', 'Meta SF AR', 'Meta SF', 'Meta F', '% SF AR', '% SF', '% F'];
const keys = ['fecha', 'llegada', 'metaSfAr', 'metaSf', 'metaF', 'pctSfAr', 'pctSf', 'pctF'];

export async function downloadPlanningTemplate(year) {
  const XLSX = await import('xlsx');
  const days = new Date(Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86400000;
  const dates = Array.from({ length: days }, (_, i) => new Date(Date.UTC(year, 0, i + 1)).toISOString().slice(0, 10));
  const sheet = XLSX.utils.aoa_to_sheet([headers, ...dates.map((date) => [date])]);
  sheet['!cols'] = [{ wch: 16 }, ...Array.from({ length: 7 }, () => ({ wch: 18 }))];
  sheet['!autofilter'] = { ref: `A1:H${days + 1}` };
  const instructions = XLSX.utils.aoa_to_sheet([
    ['Plantilla de planeación WIP'],
    ['Llena únicamente las fechas que necesitas importar. Las filas sin valores se omiten.'],
    ['Conserva los encabezados y la hoja Planeacion. Usa fechas AAAA-MM-DD.'],
    ['Llegada y metas: enteros de 0 a 10,000,000.'],
    ['Porcentajes: escribe 18.235234, no 0.18235234 ni 18.235234%. Deben sumar 100.'],
    ['Puedes completar todo el año o solo un rango. Las fechas existentes se actualizarán al confirmar.'],
  ]);
  instructions['!cols'] = [{ wch: 105 }];
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Planeacion');
  XLSX.utils.book_append_sheet(book, instructions, 'Instrucciones');
  XLSX.writeFile(book, `plantilla-planeacion-wip-${year}.xlsx`);
}

function excelDate(value, XLSX) {
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value);
    return date ? `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}` : String(value);
  }
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? '').trim();
}

export async function readPlanningExcel(file) {
  if (!/\.xlsx$/i.test(file.name)) throw new Error('Selecciona un archivo .xlsx basado en la plantilla.');
  if (file.size > 2 * 1024 * 1024) throw new Error('El archivo debe pesar menos de 2 MB.');
  const XLSX = await import('xlsx');
  const book = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: false });
  const sheet = book.Sheets.Planeacion;
  if (!sheet) throw new Error('El archivo debe contener una hoja llamada Planeacion.');
  const grid = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true });
  if (headers.some((header, index) => String(grid[0]?.[index] ?? '').trim() !== header)) {
    throw new Error('Los encabezados no coinciden con la plantilla. Descárgala nuevamente.');
  }
  const rows = [];
  for (let i = 1; i < grid.length; i++) {
    const cells = grid[i] || [];
    const values = cells.slice(1, 8);
    if (values.every((value) => value === '' || value === null || value === undefined)) continue;
    const fecha = excelDate(cells[0], XLSX);
    rows.push(Object.fromEntries(keys.map((key, index) => [key, index ? values[index - 1] : fecha])));
  }
  if (!rows.length) throw new Error('Completa al menos una fecha con sus siete valores.');
  if (rows.length > 366) throw new Error('El archivo puede contener como máximo 366 días con valores.');
  return rows;
}
