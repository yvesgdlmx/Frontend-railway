import { useCallback, useEffect, useRef, useState } from 'react';
import moment from 'moment-timezone';
import {
  AdjustmentsHorizontalIcon, ArrowPathIcon, ChartBarIcon,
} from '@heroicons/react/24/outline';
import ForecastView from './wip/ForecastView';
import PlanningView from './wip/PlanningView';
import Heading from '../../components/others/Heading';
import SelectWipDiario from '../../components/others/html_personalizado/SelectWipDiario';
import { wipApi, errorMessage } from './wip/wipApi';
import './wip/proyeccionWip.css';

const tabs = [
  { key: 'actual', label: 'Proyección actual', description: 'Corte y próximos días', Icon: ChartBarIcon },
  { key: 'planeacion', label: 'Planeación', description: 'Entradas y metas diarias', Icon: AdjustmentsHorizontalIcon },
];

export default function ProyeccionWip() {
  const [tab, setTab] = useState('actual');
  const [month, setMonth] = useState(() => moment.tz('America/Mexico_City').format('YYYY-MM'));
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const requestId = useRef(0);
  const load = useCallback(async (silent = false) => {
    const id = ++requestId.current;
    if (!silent) setLoading(true);
    try {
      const [current, monthly] = await Promise.all([
        wipApi('/actual'), wipApi('/mes', { params: { mes: month } }),
      ]);
      if (id === requestId.current) { setResponse({ ...current, monthView: monthly.view }); setError(''); }
    } catch (e) { if (id === requestId.current) setError(errorMessage(e)); }
    finally { if (id === requestId.current) setLoading(false); }
  }, [month]);

  useEffect(() => {
    load();
    const timer = setInterval(() => load(true), 60000);
    return () => { clearInterval(timer); requestId.current += 1; };
  }, [load]);

  const monthView = response?.monthView;
  const currentYear = moment.tz('America/Mexico_City').year();
  const yearOptions = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => ({ value: currentYear - i, label: String(currentYear - i) }));
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const value = String(i + 1).padStart(2, '0');
    const label = new Date(2026, i, 1).toLocaleDateString('es-MX', { month: 'long' });
    return { value, label: label.charAt(0).toUpperCase() + label.slice(1) };
  });
  return <main className="wip-page">
    <div className="wip-title"><Heading title="Proyección de WIP" /></div>

    <nav className="wip-tabs" aria-label="Secciones de proyección">{tabs.map(({ key, label, description, Icon }) =>
      <button key={key} type="button" aria-current={tab === key ? 'page' : undefined} onClick={() => setTab(key)}>
        <span className="wip-tab-icon"><Icon /></span><span><strong>{label}</strong><small>{description}</small></span>
      </button>)}</nav>

    {error && <p className="wip-error" role="alert">{error}</p>}
    <div hidden={tab !== 'actual'}>
      <div className="wip-forecast-toolbar">
        <div className="wip-report-filters">
          <div className="wip-report-filter"><SelectWipDiario compact inputId="wip-report-year" aria-label="Año" options={yearOptions} value={yearOptions.find((option) => option.value === Number(month.slice(0, 4)))} onChange={(option) => { if (option) setMonth(`${option.value}-${month.slice(5)}`); }} isSearchable={false} isClearable={false} placeholder="Año" /></div>
          <div className="wip-report-filter"><SelectWipDiario compact inputId="wip-report-month" aria-label="Mes" options={monthOptions} value={monthOptions.find((option) => option.value === month.slice(5))} onChange={(option) => { if (option) setMonth(`${month.slice(0, 4)}-${option.value}`); }} isSearchable={false} isClearable={false} placeholder="Mes" /></div>
        </div>
        <div className="wip-actions">
          <button type="button" className="wip-icon" title="Actualizar proyección" aria-label="Actualizar proyección" disabled={loading} onClick={() => load()}><ArrowPathIcon className={loading ? 'animate-spin' : ''} /></button>
        </div>
      </div>
      {loading ? <div className="wip-empty" role="status">Cargando mes...</div> : monthView?.blocks.length ? <ForecastView projection={monthView} /> : <div className="wip-empty">No hay cortes ni proyecciones disponibles para este mes.</div>}
    </div>

    <div hidden={tab !== 'planeacion'}><PlanningView onSaved={() => load()} /></div>
  </main>;
}
