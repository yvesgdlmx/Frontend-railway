import { CalendarDaysIcon, ChartBarIcon, ClockIcon, Cog6ToothIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { number, dayLabel } from './wipApi';

const categories = [['sfAr', 'SF AR'], ['sf', 'SF'], ['f', 'F']];
const goalKey = { sfAr: 'metaSfAr', sf: 'metaSf', f: 'metaF' };
const ageClass = (age) => `wip-age-${age <= 2 ? 'low' : age <= 5 ? 'medium' : 'high'}`;

export default function ForecastView({ projection }) {
  if (!projection?.blocks.length) return null;
  const { blocks, cut, missingDate } = projection;
  const last = blocks.at(-1);
  const baseBlock = blocks.find((block) => block.fecha === cut?.fecha);

  return <div className="wip-forecast">
    {missingDate && <div className="wip-notice" role="status"><InformationCircleIcon />Falta planeación del {dayLabel(missingDate)}. La proyección llega hasta el {dayLabel(last.fecha)}.</div>}
    {baseBlock && cut.sourceWip !== baseBlock.total && <div className="wip-notice"><InformationCircleIcon />WIP del reporte: {number(cut.sourceWip)}. Suma de SF AR, SF y F: {number(baseBlock.total)}. Diferencia: {number(cut.sourceWip - baseBlock.total)}.</div>}

    <div className="wip-matrices">{blocks.map((block) => <section className="wip-matrix-section" data-fecha={block.fecha} key={block.fecha}>
      <div className="wip-matrix-head"><div className="wip-matrix-title"><span className="wip-header-icon"><CalendarDaysIcon /></span><div><h3>{dayLabel(block.fecha)}</h3><p>{block.real ? 'Corte registrado a las 00:00' : 'Saldo estimado al iniciar el día'}</p></div></div>
        <div className="wip-matrix-right"><span className={`wip-status ${block.real ? 'wip-status-real' : ''}`}>{block.real ? 'Real' : 'Proyectado'}</span>
          {block.movement && <span className="wip-matrix-meta">Entrada prevista <strong>{number(block.movement.plannedArrival)}</strong></span>}</div>
      </div>
      <div className="wip-kpis">
        <div className="wip-kpi wip-kpi-main"><span className="wip-kpi-icon"><ChartBarIcon /></span><div><span>WIP</span><strong>{number(block.total)}</strong><small>{block.real ? 'Corte real' : 'Saldo proyectado'}</small></div></div>
        <div className="wip-kpi"><span className="wip-kpi-icon"><Cog6ToothIcon /></span><div><span>Meta de producción</span><strong>{block.plan ? number(Number(block.plan.metaSfAr) + Number(block.plan.metaSf) + Number(block.plan.metaF)) : '--'}</strong><small>Objetivo del día, no producción real</small></div></div>
        <div className="wip-kpi"><span className="wip-kpi-icon"><ClockIcon /></span><div><span>Mayor antigüedad</span><strong>{block.columns.length ? Math.max(...block.columns.map((column) => column.age)) : '--'} {block.columns.length > 0 && <em>días</em>}</strong><small>Trabajo pendiente más antiguo</small></div></div>
      </div>
      <p className="wip-mobile-scroll-hint">Desliza la tabla para ver las fechas →</p>
      <div className="wip-scroll"><table className="wip-matrix">
        <caption className="sr-only">{dayLabel(block.fecha)}: {block.real ? 'corte real' : 'proyectado'}, WIP {number(block.total)}</caption>
        <thead><tr><th className="wip-category-head">Tipo</th><th>Meta diaria</th>
          {block.columns.map((c) => <th key={c.fecha}><span className="wip-column-date">{new Date(`${c.fecha}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span><small>{c.age} d</small></th>)}<th>Total</th>
        </tr></thead>
        <tbody>{categories.map(([key, label]) => <tr key={key}>
          <th scope="row">{label}</th><td className="wip-goal">{number(block.plan?.[goalKey[key]])}</td>
          {block.columns.map((c) => <td key={c.fecha} className={ageClass(c.age)}>{number(c[key])}</td>)}<td className="wip-row-total">{number(block.totals[key])}</td>
        </tr>)}</tbody>
        <tfoot><tr><th colSpan="2">Total</th>{block.columns.map((c) => <td key={c.fecha}>{number(c.total)}</td>)}<td>{number(block.total)}</td></tr></tfoot>
      </table></div>
    </section>)}</div>

  </div>;
}
