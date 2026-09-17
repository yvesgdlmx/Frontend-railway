import React, { useRef, useEffect, useState } from 'react'

const TablaResumenResultado = ({ datos }) => {
  // Verificar si una fecha es del día actual
  const esHoy = (fecha) => {
    const hoy = new Date();
    const fechaRegistro = new Date(fecha + 'T00:00:00');
    return fechaRegistro.toDateString() === hoy.toDateString();
  }

  const formatNumber = (num, fecha) => {
    if (num === null || num === undefined) {
      return esHoy(fecha) ? 'ESPERANDO...' : '0';
    }
    if (num === 0) return '0.00';
    return num.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatInteger = (num, fecha) => {
    if (num === null || num === undefined) {
      return esHoy(fecha) ? 'ESPERANDO...' : '0';
    }
    return Math.round(num).toLocaleString('es-MX')
  }

  const formatCurrency = (num, fecha) => {
    if (num === null || num === undefined) {
      return esHoy(fecha) ? 'ESPERANDO...' : '0';
    }
    return `$${num.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Función para obtener clase de color según el valor (fondo + texto)
  const getColorClass = (num) => {
    if (num === null || num === undefined || num === 0) return 'text-slate-500 bg-slate-50'
    return num > 0 
      ? 'text-emerald-700 font-semibold bg-emerald-50' 
      : 'text-rose-700 font-semibold bg-rose-50'
  }

  // Función para obtener clase de color para indicadores
  const getIndicadorColorClass = (num) => {
    // Si es null, undefined o 0 → ROJO
    if (num === null || num === undefined || num === 0) return 'text-rose-700 font-semibold bg-rose-50'
    // Si es mayor a 4.0 → VERDE
    if (num > 4.0) return 'text-emerald-700 font-semibold bg-emerald-50'
    // Si es mayor a 0 pero menor o igual a 4.0 → ROJO
    return 'text-rose-700 font-semibold bg-rose-50'
  }

  // Sticky header logic
  const containerRef = useRef()
  const tableRef = useRef()
  const stickyRef = useRef()
  const [colWidths, setColWidths] = useState([])

  useEffect(() => {
    if (tableRef.current) {
      const ths = tableRef.current.querySelectorAll("thead th")
      setColWidths(Array.from(ths).map((th) => th.offsetWidth))
    }
  }, [datos.length])

  useEffect(() => {
    const handleResize = () => {
      if (tableRef.current) {
        const ths = tableRef.current.querySelectorAll("thead th")
        setColWidths(Array.from(ths).map((th) => th.offsetWidth))
      }
      syncStickyHeaderPosition()
    }
    
    const handleScroll = () => {
      syncStickyHeaderPosition()
      checkStickyVisibility()
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("scroll", handleScroll)
    
    if (containerRef.current) {
      containerRef.current.addEventListener("scroll", syncStickyHeaderPosition)
    }

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll)
      if (containerRef.current) {
        containerRef.current.removeEventListener("scroll", syncStickyHeaderPosition)
      }
    }
    // eslint-disable-next-line
  }, [])

  function syncStickyHeaderPosition() {
    if (!tableRef.current || !stickyRef.current || !containerRef.current) return
    
    const containerRect = containerRef.current.getBoundingClientRect()
    
    stickyRef.current.style.left = `${containerRect.left}px`
    stickyRef.current.style.width = `${containerRect.width}px`
    
    const scrollLeft = containerRef.current.scrollLeft
    const stickyTable = stickyRef.current.querySelector('table')
    if (stickyTable) {
      stickyTable.style.transform = `translateX(-${scrollLeft}px)`
      stickyTable.style.width = `${tableRef.current.offsetWidth}px`
    }
  }

  function checkStickyVisibility() {
    if (!tableRef.current || !stickyRef.current || !containerRef.current) return
    
    const tableRect = tableRef.current.getBoundingClientRect()
    
    if (tableRect.top < 110 && tableRect.bottom > 110) {
      stickyRef.current.style.display = "block"
      syncStickyHeaderPosition()
    } else {
      stickyRef.current.style.display = "none"
    }
  }

  useEffect(() => {
    syncStickyHeaderPosition()
    // eslint-disable-next-line
  }, [colWidths])

  useEffect(() => {
    window.addEventListener("scroll", checkStickyVisibility)
    return () => window.removeEventListener("scroll", checkStickyVisibility)
  }, [])

  return (
    <div ref={containerRef} className="relative overflow-x-auto bg-white">
      {/* Sticky header */}
      <div
        ref={stickyRef}
        style={{
          position: "fixed",
          top: "107px",
          zIndex: 50,
          display: "none",
          background: "#2563eb",
          overflow: "hidden",
        }}
      >
        <table className="min-w-full">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th style={{ width: colWidths[0] }} className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 first:border-l-0 text-[11px] uppercase tracking-wide whitespace-nowrap">SEMANA</th>
              <th style={{ width: colWidths[1] }} className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">FECHA</th>
              <th style={{ width: colWidths[2] }} className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">META SF</th>
              <th style={{ width: colWidths[3] }} className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">REAL SF</th>
              <th style={{ width: colWidths[4] }} className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">DIFERENCIA</th>
              <th style={{ width: colWidths[5] }} className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">ACUMULADO SF MENSUAL</th>
              <th style={{ width: colWidths[6] }} className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">META F</th>
              <th style={{ width: colWidths[7] }} className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">REAL F</th>
              <th style={{ width: colWidths[8] }} className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">DIFERENCIA</th>
              <th style={{ width: colWidths[9] }} className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">ACUMULADO F MENSUAL</th>
              <th style={{ width: colWidths[10] }} className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">PROYECTADO SUMA</th>
              <th style={{ width: colWidths[11] }} className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">REAL SUMA</th>
              <th style={{ width: colWidths[12] }} className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">TRABAJOS NOCTURNO</th>
              <th style={{ width: colWidths[13] }} className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">TRABAJOS MATUTINO</th>
              <th style={{ width: colWidths[14] }} className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">TRABAJOS VESPERTINO</th>
              <th style={{ width: colWidths[15] }} className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">ASISTENCIA NOCTURNO</th>
              <th style={{ width: colWidths[16] }} className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">ASISTENCIA MATUTINO</th>
              <th style={{ width: colWidths[17] }} className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">ASISTENCIA VESPERTINO</th>
              <th style={{ width: colWidths[18] }} className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">OHO NOCTURNO</th>
              <th style={{ width: colWidths[19] }} className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">OHO MATUTINO</th>
              <th style={{ width: colWidths[20] }} className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">OHO VESPERTINO</th>
              <th style={{ width: colWidths[21] }} className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">FACT PROYECT</th>
              <th style={{ width: colWidths[22] }} className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">FACTURACIÓN REAL</th>
              <th style={{ width: colWidths[23] }} className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">DIFERENCIA</th>
              <th style={{ width: colWidths[24] }} className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">ACUMULADO MENSUAL</th>
              <th style={{ width: colWidths[25] }} className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">ACUMULADO ANUAL</th>
              <th style={{ width: colWidths[26] }} className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">ACUMULADO QUINCENAL</th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Tabla principal */}
      <table ref={tableRef} className="min-w-full bg-white text-sm">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 first:border-l-0 text-[11px] uppercase tracking-wide whitespace-nowrap">SEMANA</th>
            <th className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">FECHA</th>
            <th className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">META SF</th>
            <th className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">REAL SF</th>
            <th className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">DIFERENCIA</th>
            <th className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">ACUMULADO SF MENSUAL</th>
            <th className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">META F</th>
            <th className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">REAL F</th>
            <th className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">DIFERENCIA</th>
            <th className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">ACUMULADO F MENSUAL</th>
            <th className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">PROYECTADO SUMA</th>
            <th className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">REAL SUMA</th>
            <th className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">TRABAJOS NOCTURNO</th>
            <th className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">TRABAJOS MATUTINO</th>
            <th className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">TRABAJOS VESPERTINO</th>
            <th className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">ASISTENCIA NOCTURNO</th>
            <th className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">ASISTENCIA MATUTINO</th>
            <th className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">ASISTENCIA VESPERTINO</th>
            <th className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">OHO NOCTURNO</th>
            <th className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">OHO MATUTINO</th>
            <th className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">OHO VESPERTINO</th>
            <th className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">FACT PROYECT</th>
            <th className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">FACTURACIÓN REAL</th>
            <th className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">DIFERENCIA</th>
            <th className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">ACUMULADO MENSUAL</th>
            <th className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">ACUMULADO ANUAL</th>
            <th className="py-3.5 px-4 text-center font-semibold border-l border-blue-500/50 text-[11px] uppercase tracking-wide whitespace-nowrap">ACUMULADO QUINCENAL</th>
          </tr>
        </thead>
          <tbody className="text-sm text-center text-slate-600">
          {datos.map((fila, index) => (
            <tr key={index} className={`border-t border-slate-100 hover:bg-blue-50/80 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}>
              <td className="sticky left-0 z-20 whitespace-nowrap border-r border-slate-200 bg-blue-50 px-5 py-3 font-semibold text-blue-700 shadow-[1px_0_0_0_rgba(226,232,240,1)]">{fila.semana}</td>
              <td className="sticky left-[73px] z-20 whitespace-nowrap border-r border-slate-200 bg-blue-50 px-5 py-3 font-semibold text-blue-700 shadow-[1px_0_0_0_rgba(226,232,240,1)]">{fila.diario}</td>
              <td className="py-3 px-4 border-r border-slate-100 text-slate-500 whitespace-nowrap">{formatInteger(fila.metaSF, fila.diario)}</td>
              <td className="py-3 px-4 border-r border-slate-100 text-slate-500 whitespace-nowrap">{formatInteger(fila.realSF, fila.diario)}</td>
              <td className={`py-3 px-4 border-r border-slate-100 whitespace-nowrap ${getColorClass(fila.diferenciaSF)}`}>{formatInteger(fila.diferenciaSF, fila.diario)}</td>
              <td className={`py-3 px-4 border-r border-slate-100 whitespace-nowrap ${getColorClass(fila.acumuladoSF)}`}>{formatInteger(fila.acumuladoSF, fila.diario)}</td>
              <td className="py-3 px-4 border-r border-slate-100 text-slate-500 whitespace-nowrap">{formatInteger(fila.metaF, fila.diario)}</td>
              <td className="py-3 px-4 border-r border-slate-100 text-slate-500 whitespace-nowrap">{formatInteger(fila.realF, fila.diario)}</td>
              <td className={`py-3 px-4 border-r border-slate-100 whitespace-nowrap ${getColorClass(fila.diferenciaF)}`}>{formatInteger(fila.diferenciaF, fila.diario)}</td>
              <td className={`py-3 px-4 border-r border-slate-100 whitespace-nowrap ${getColorClass(fila.acumuladoF)}`}>{formatInteger(fila.acumuladoF, fila.diario)}</td>
              <td className="py-3 px-4 border-r border-slate-100 text-slate-500 whitespace-nowrap">{formatInteger(fila.proyectadoSuma, fila.diario)}</td>
              <td className="py-3 px-4 border-r border-slate-100 text-slate-500 whitespace-nowrap">{formatInteger(fila.realSuma, fila.diario)}</td>
              <td className="py-3 px-4 border-r border-slate-100 text-slate-500 whitespace-nowrap">{formatInteger(fila.trabajosNocturno, fila.diario)}</td>
              <td className="py-3 px-4 border-r border-slate-100 text-slate-500 whitespace-nowrap">{formatInteger(fila.trabajosMat, fila.diario)}</td>
              <td className="py-3 px-4 border-r border-slate-100 text-slate-500 whitespace-nowrap">{formatInteger(fila.trabajosVesp, fila.diario)}</td>
              <td className="py-3 px-4 border-r border-slate-100 text-slate-500 whitespace-nowrap">{formatInteger(fila.asistenciaNocturno, fila.diario)}</td>
              <td className="py-3 px-4 border-r border-slate-100 text-slate-500 whitespace-nowrap">{formatInteger(fila.asistenciaMat, fila.diario)}</td>
              <td className="py-3 px-4 border-r border-slate-100 text-slate-500 whitespace-nowrap">{formatInteger(fila.asistenciaVesp, fila.diario)}</td>
              <td className={`py-3 px-4 border-r border-slate-100 whitespace-nowrap ${getIndicadorColorClass(fila.indicadorNocturno)}`}>{formatNumber(fila.indicadorNocturno, fila.diario)}</td>
              <td className={`py-3 px-4 border-r border-slate-100 whitespace-nowrap ${getIndicadorColorClass(fila.indicadorNocturnoMat)}`}>{formatNumber(fila.indicadorNocturnoMat, fila.diario)}</td>
              <td className={`py-3 px-4 border-r border-slate-100 whitespace-nowrap ${getIndicadorColorClass(fila.indicadorVesp)}`}>{formatNumber(fila.indicadorVesp, fila.diario)}</td>
              <td className="py-3 px-4 border-r border-slate-100 text-slate-500 whitespace-nowrap">{formatCurrency(fila.factProyect, fila.diario)}</td>
              <td className="py-3 px-4 border-r border-slate-100 text-slate-500 whitespace-nowrap">{formatCurrency(fila.facturacionReal, fila.diario)}</td>
              <td className={`py-3 px-4 border-r border-slate-100 whitespace-nowrap ${getColorClass(fila.diferencia2)}`}>{formatCurrency(fila.diferencia2, fila.diario)}</td>
              <td className={`py-3 px-4 border-r border-slate-100 whitespace-nowrap ${getColorClass(fila.acumuladoMensual)}`}>{formatCurrency(fila.acumuladoMensual, fila.diario)}</td>
              <td className={`py-3 px-4 border-r border-slate-100 whitespace-nowrap ${getColorClass(fila.acumuladoAnual)}`}>{formatCurrency(fila.acumuladoAnual, fila.diario)}</td>
              <td className={`py-3 px-4 border-r border-slate-100 whitespace-nowrap ${getColorClass(fila.acumuladoQuincenal)}`}>{formatCurrency(fila.acumuladoQuincenal, fila.diario)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TablaResumenResultado

