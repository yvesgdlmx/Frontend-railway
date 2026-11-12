import { useEffect, useRef, useState } from 'react';
import moment from 'moment-timezone';
import { CheckIcon, ArrowPathIcon, CalendarDaysIcon, CheckCircleIcon, ExclamationCircleIcon, XMarkIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import SelectWipDiario from '../../../components/others/html_personalizado/SelectWipDiario';
import { wipApi, errorMessage, number } from './wipApi';
import { downloadPlanningTemplate, readPlanningExcel } from './planningExcel';

const fields = [['llegada', 'Llegada total'], ['metaSfAr', 'Meta SF AR'], ['metaSf', 'Meta SF'], ['metaF', 'Meta F'], ['pctSfAr', '% SF AR'], ['pctSf', '% SF'], ['pctF', '% F']];
const months = Array.from({ length: 12 }, (_, i) => new Date(2026, i, 1).toLocaleDateString('es-MX', { month: 'long' }));
const dateLabel = (fecha) => {
  const date = new Date(`${fecha}T12:00:00`);
  const weekday = date.toLocaleDateString('es-MX', { weekday: 'short' }).replace('.', '').toUpperCase();
  const month = date.toLocaleDateString('es-MX', { month: 'short' }).replace('.', '');
  return <span className="wip-plan-date">
    <span className="wip-plan-date-main"><span className="wip-plan-weekday">{weekday}</span><strong>{date.getDate()} {month}</strong></span>
    <small>{fecha}</small>
  </span>;
};

export default function PlanningView({ onSaved }) {
  const now = moment.tz('America/Mexico_City');
  const currentYear = now.year();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1].map((value) => ({ value, label: String(value) }));
  const monthOptions = months.map((label, value) => ({ value, label: label.charAt(0).toUpperCase() + label.slice(1) }));
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(now.month());
  const [rows, setRows] = useState({});
  const [dirty, setDirty] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInput = useRef(null);
  const editable = year === currentYear;
  const showError = (title, message) => setToast({ type: 'error', title, message });
  const showSuccess = (title, message) => setToast({ type: 'success', title, message });

  useEffect(() => {
    let live = true;
    setPreview(null);
    setLoading(true); setToast(null);
    wipApi(`/planeacion/${year}`).then((data) => {
      if (live) { setRows(Object.fromEntries(data.rows.map((r) => [r.fecha, r]))); setDirty(new Set()); }
    }).catch((e) => { if (live) showError('No se pudo cargar la planeación', errorMessage(e)); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [year]);

  useEffect(() => {
    const guard = (event) => { if (dirty.size) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [dirty]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), toast.type === 'error' ? 7000 : 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const dates = Array.from({ length: moment.utc([year, month, 1]).daysInMonth() }, (_, i) => moment.utc([year, month, i + 1]).format('YYYY-MM-DD'));
  const edit = (fecha, key, value) => {
    setPreview(null);
    setRows((prev) => ({ ...prev, [fecha]: { ...Object.fromEntries(fields.map(([f]) => [f, ''])), ...prev[fecha], fecha, [key]: value } }));
    setDirty((prev) => new Set([...prev, fecha])); setToast(null);
  };
  const save = async () => {
    setToast(null); setSaving(true);
    try {
      await wipApi(`/planeacion/${year}`, { method: 'PUT', data: { rows: [...dirty].map((fecha) => Object.fromEntries(['fecha', ...fields.map(([key]) => key)].map((key) => [key, rows[fecha][key]]))) } });
      setDirty(new Set()); showSuccess('Planeación guardada', 'Los cambios se registraron correctamente.'); onSaved();
    } catch (e) { showError('No se pudo guardar', errorMessage(e)); } finally { setSaving(false); }
  };
  const downloadTemplate = async () => {
    setToast(null);
    try { await downloadPlanningTemplate(year); showSuccess('Plantilla descargada', 'Llena las fechas que necesites y después sube el archivo.'); }
    catch (e) { showError('No se pudo descargar la plantilla', e.message || 'Inténtalo de nuevo.'); }
  };
  const selectFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setToast(null); setPreview(null);
    if (dirty.size) { showError('Cambios pendientes', 'Guarda primero los cambios manuales antes de importar un archivo.'); return; }
    setImporting(true);
    try {
      const candidate = await readPlanningExcel(file);
      const result = await wipApi(`/planeacion/${year}/vista-previa`, { method: 'POST', data: { rows: candidate } });
      setPreview({ fileName: file.name, ...result });
      showSuccess('Archivo listo para revisar', `${result.rows.length} fechas validadas. Confirma la carga para guardarlas.`);
    } catch (e) { showError('Revisa el archivo', e.response ? errorMessage(e) : e.message); }
    finally { setImporting(false); }
  };
  const confirmImport = async () => {
    if (!preview) return;
    setToast(null); setImporting(true);
    try {
      await wipApi(`/planeacion/${year}`, { method: 'PUT', data: { rows: preview.rows.map(({ status, ...row }) => row) } });
      const data = await wipApi(`/planeacion/${year}`);
      setRows(Object.fromEntries(data.rows.map((row) => [row.fecha, row])));
      setDirty(new Set()); setPreview(null);
      showSuccess('Planeación importada', `${preview.rows.length} fechas procesadas correctamente.`); onSaved();
    } catch (e) { showError('No se pudo importar', errorMessage(e)); }
    finally { setImporting(false); }
  };
  return <section className="wip-planning">
    <div className="wip-plan-toolbar" role="group" aria-label="Filtros e importación de planeación">
      <div className="wip-report-filters">
        <div className="wip-report-filter"><SelectWipDiario compact inputId="wip-plan-year" aria-label="Año" options={yearOptions} value={yearOptions.find((option) => option.value === year)} isDisabled={loading || saving || importing} isSearchable={false} isClearable={false} placeholder="Año" onChange={(option) => {
          if (option && (!dirty.size || window.confirm('Hay cambios sin guardar. Descartarlos y cambiar de año?'))) { setYear(option.value); setToast(null); }
        }} /></div>
        <div className="wip-report-filter"><SelectWipDiario compact inputId="wip-plan-month" aria-label="Mes" options={monthOptions} value={monthOptions.find((option) => option.value === month)} onChange={(option) => { if (option) setMonth(option.value); }} isSearchable={false} isClearable={false} placeholder="Mes" /></div>
      </div>
      {editable && <div className="wip-import-actions">
        <button type="button" onClick={downloadTemplate} disabled={importing}><ArrowDownTrayIcon />Descargar plantilla</button>
        <button type="button" onClick={() => fileInput.current?.click()} disabled={importing || loading || saving}><ArrowUpTrayIcon />{importing ? 'Procesando...' : 'Subir archivo'}</button>
        <input ref={fileInput} type="file" accept=".xlsx" className="sr-only" aria-label="Archivo de planeación Excel" onChange={selectFile} />
      </div>}
    </div>
    {!editable && <p className="wip-notice">Planeacion de consulta. La captura esta habilitada para {currentYear}.</p>}
    {toast && <div className={`wip-save-toast ${toast.type === 'error' ? 'wip-save-toast-error' : ''}`} role={toast.type === 'error' ? 'alert' : 'status'} aria-live={toast.type === 'error' ? 'assertive' : 'polite'}>
      <span className="wip-save-toast-icon">{toast.type === 'error' ? <ExclamationCircleIcon /> : <CheckCircleIcon />}</span>
      <div className="wip-save-toast-copy"><strong>{toast.title}</strong><span>{toast.message}</span></div>
      <button type="button" aria-label="Cerrar notificación" onClick={() => setToast(null)}><XMarkIcon /></button>
      <span className="wip-save-toast-progress" aria-hidden="true" />
    </div>}
    {preview && <div className="wip-import-preview">
      <div className="wip-import-preview-head"><div><h3>Revisar carga · {preview.fileName}</h3><p>{preview.rows.length} fechas · {preview.counts.nuevo} nuevas · {preview.counts.actualizar} se actualizarán · {preview.counts.sinCambios} sin cambios</p></div>
        <div className="wip-import-actions"><button type="button" onClick={() => setPreview(null)} disabled={importing}>Cancelar</button><button type="button" className="wip-import-confirm" onClick={confirmImport} disabled={importing || (!preview.counts.nuevo && !preview.counts.actualizar)}>{importing ? 'Guardando...' : 'Confirmar carga'}</button></div>
      </div>
      <div className="wip-import-preview-scroll"><table><thead><tr><th>Fecha</th>{fields.map(([key, label]) => <th key={key}>{label}</th>)}<th>Resultado</th></tr></thead><tbody>{preview.rows.map((row) => <tr key={row.fecha}><th scope="row">{row.fecha}</th>{fields.map(([key]) => <td key={key}>{number(row[key])}</td>)}<td><span className={`wip-import-status wip-import-${row.status === 'sin cambios' ? 'same' : row.status === 'nuevo' ? 'new' : 'update'}`}>{row.status}</span></td></tr>)}</tbody></table></div>
    </div>}
    {loading ? <p role="status">Cargando planeacion...</p> : <>
      <div className="wip-plan-card"><div className="wip-plan-card-head"><div className="wip-panel-title"><span className="wip-panel-icon"><CalendarDaysIcon /></span><div><h3>{months[month]} {year}</h3></div></div>
        {editable && <button type="button" className="wip-plan-save" disabled={!dirty.size || loading || saving || importing} onClick={save}>{saving ? <ArrowPathIcon className="animate-spin" /> : <CheckIcon />}{saving ? 'Guardando...' : 'Guardar'}</button>}
      </div>
      <div className="wip-scroll"><table className="wip-plan-table"><caption className="sr-only">Planeación diaria de {months[month]} {year}</caption><thead>
        <tr className="wip-plan-group"><th rowSpan="2">Fecha</th><th colSpan="1">Entrada</th><th colSpan="3">Metas de producción</th><th colSpan="3">Distribución de llegada</th><th rowSpan="2">Estado</th></tr>
        <tr className="wip-plan-columns">{fields.map(([key, label]) => <th key={key}>{label}</th>)}</tr></thead>
        <tbody>{dates.map((fecha) => <tr key={fecha} className={moment.utc(fecha).day() === 0 ? 'wip-sunday' : ''}>
          <th scope="row">{dateLabel(fecha)}</th>
          {fields.map(([key, label]) => <td key={key} data-label={label}><input aria-label={`${label} ${fecha}`} type="number" min="0" max={key.startsWith('pct') ? 100 : 10000000} step={key.startsWith('pct') ? '0.000001' : '1'} disabled={!editable || saving || importing} placeholder="--" value={rows[fecha]?.[key] ?? ''} onChange={(e) => edit(fecha, key, e.target.value)} /></td>)}
          <td data-label="Estado"><span className={`wip-plan-status ${dirty.has(fecha) ? 'wip-plan-pending' : rows[fecha] ? 'wip-plan-saved' : ''}`}>{dirty.has(fecha) ? 'Sin guardar' : rows[fecha] ? 'Guardado' : 'Sin capturar'}</span></td>
        </tr>)}</tbody>
        <tfoot><tr><th>Total del mes</th><td data-label="Llegada total">{number(dates.reduce((s, d) => s + Number(rows[d]?.llegada || 0), 0))}</td>{[['metaSfAr', 'Meta SF AR'], ['metaSf', 'Meta SF'], ['metaF', 'Meta F']].map(([key, label]) => <td key={key} data-label={label}>{number(dates.reduce((s, d) => s + Number(rows[d]?.[key] || 0), 0))}</td>)}<td colSpan="4"></td></tr></tfoot>
      </table></div></div>
    </>}
  </section>;
}
