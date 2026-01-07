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
    if (num === null || num === undefined || num === 0) return 'text-gray-500 bg-gray-50'
    return num > 0 
      ? 'text-green-500 font-bold bg-green-200' 
      : 'text-red-500 font-bold bg-red-200'
  }

  // Función para obtener clase de color para indicadores
  const getIndicadorColorClass = (num) => {
    // Si es null, undefined o 0 → ROJO
    if (num === null || num === undefined || num === 0) return 'text-red-500 font-bold bg-red-200'
    // Si es mayor a 4.0 → VERDE
    if (num > 4.0) return 'text-green-500 font-bold bg-green-200'
    // Si es mayor a 0 pero menor o igual a 4.0 → ROJO
    return 'text-red-500 font-bold bg-red-200'
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
    <div ref={containerRef} className="overflow-x-auto relative">
      {/* Sticky header */}
      <div
        ref={stickyRef}
        style={{
          position: "fixed",
          top: "107px",
          zIndex: 50,
          display: "none",
          background: "#3b82f6",
          overflow: "hidden",
        }}
      >
        <table className="min-w-full">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th style={{ width: colWidths[0] }} className="py-4 px-6 text-left font-semibold border-l first:border-l-0 text-sm whitespace-nowrap">SEMANA</th>
              <th style={{ width: colWidths[1] }} className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">FECHA</th>
              <th style={{ width: colWidths[2] }} className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">META SF</th>
              <th style={{ width: colWidths[3] }} className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">REAL SF</th>
              <th style={{ width: colWidths[4] }} className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">DIFERENCIA</th>
              <th style={{ width: colWidths[5] }} className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">ACUMULADO SF MENSUAL</th>
              <th style={{ width: colWidths[6] }} className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">META F</th>
              <th style={{ width: colWidths[7] }} className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">REAL F</th>
              <th style={{ width: colWidths[8] }} className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">DIFERENCIA</th>
              <th style={{ width: colWidths[9] }} className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">ACUMULADO F MENSUAL</th>
              <th style={{ width: colWidths[10] }} className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">PROYECTADO SUMA</th>
              <th style={{ width: colWidths[11] }} className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">REAL SUMA</th>
              <th style={{ width: colWidths[12] }} className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">TRABAJOS NOCTURNO</th>
              <th style={{ width: colWidths[13] }} className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">TRABAJOS MATUTINO</th>
              <th style={{ width: colWidths[14] }} className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">TRABAJOS VESPERTINO</th>
              <th style={{ width: colWidths[15] }} className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">ASISTENCIA NOCTURNO</th>
              <th style={{ width: colWidths[16] }} className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">ASISTENCIA MATUTINO</th>
              <th style={{ width: colWidths[17] }} className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">ASISTENCIA VESPERTINO</th>
              <th style={{ width: colWidths[18] }} className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">OHO NOCTURNO</th>
              <th style={{ width: colWidths[19] }} className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">OHO MATUTINO</th>
              <th style={{ width: colWidths[20] }} className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">OHO VESPERTINO</th>
              <th style={{ width: colWidths[21] }} className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">FACT PROYECT</th>
              <th style={{ width: colWidths[22] }} className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">FACTURACIÓN REAL</th>
              <th style={{ width: colWidths[23] }} className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">DIFERENCIA</th>
              <th style={{ width: colWidths[24] }} className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">ACUMULADO MENSUAL</th>
              <th style={{ width: colWidths[25] }} className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">ACUMULADO ANUAL</th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Tabla principal */}
      <table ref={tableRef} className="min-w-full bg-white border rounded-lg shadow-lg text-sm">
        <thead>
          <tr className="bg-blue-500 text-white">
            <th className="py-4 px-6 text-left font-semibold border-l first:border-l-0 text-sm whitespace-nowrap">SEMANA</th>
            <th className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">FECHA</th>
            <th className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">META SF</th>
            <th className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">REAL SF</th>
            <th className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">DIFERENCIA</th>
            <th className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">ACUMULADO SF MENSUAL</th>
            <th className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">META F</th>
            <th className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">REAL F</th>
            <th className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">DIFERENCIA</th>
            <th className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">ACUMULADO F MENSUAL</th>
            <th className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">PROYECTADO SUMA</th>
            <th className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">REAL SUMA</th>
            <th className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">TRABAJOS NOCTURNO</th>
            <th className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">TRABAJOS MATUTINO</th>
            <th className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">TRABAJOS VESPERTINO</th>
            <th className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">ASISTENCIA NOCTURNO</th>
            <th className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">ASISTENCIA MATUTINO</th>
            <th className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">ASISTENCIA VESPERTINO</th>
            <th className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">OHO NOCTURNO</th>
            <th className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">OHO MATUTINO</th>
            <th className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">OHO VESPERTINO</th>
            <th className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">FACT PROYECT</th>
            <th className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">FACTURACIÓN REAL</th>
            <th className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">DIFERENCIA</th>
            <th className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">ACUMULADO MENSUAL</th>
            <th className="py-4 px-6 text-left font-semibold border-l text-sm whitespace-nowrap">ACUMULADO ANUAL</th>
          </tr>
        </thead>
          <tbody className="text-md text-center">
          {datos.map((fila, index) => (
            <tr key={index} className={`border-t border-gray-200 hover:bg-blue-100 ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}`}>
              <td className="py-3 px-5 border border-white sticky left-0 bg-inherit z-10 font-bold whitespace-nowrap bg-yellow-100 text-orange-400">{fila.semana}</td>
              <td className="py-3 px-5 border border-white sticky left-[73px] bg-inherit z-10 font-bold whitespace-nowrap bg-yellow-100 text-orange-400">{fila.diario}</td>
              <td className="py-3 px-5 border text-gray-500 whitespace-nowrap">{formatInteger(fila.metaSF, fila.diario)}</td>
              <td className="py-3 px-5 border text-gray-500 whitespace-nowrap">{formatInteger(fila.realSF, fila.diario)}</td>
              <td className={`py-3 px-5 border whitespace-nowrap ${getColorClass(fila.diferenciaSF)}`}>{formatInteger(fila.diferenciaSF, fila.diario)}</td>
              <td className={`py-3 px-5 border whitespace-nowrap ${getColorClass(fila.acumuladoSF)}`}>{formatInteger(fila.acumuladoSF, fila.diario)}</td>
              <td className="py-3 px-5 border text-gray-500 whitespace-nowrap">{formatInteger(fila.metaF, fila.diario)}</td>
              <td className="py-3 px-5 border text-gray-500 whitespace-nowrap">{formatInteger(fila.realF, fila.diario)}</td>
              <td className={`py-3 px-5 border whitespace-nowrap ${getColorClass(fila.diferenciaF)}`}>{formatInteger(fila.diferenciaF, fila.diario)}</td>
              <td className={`py-3 px-5 border whitespace-nowrap ${getColorClass(fila.acumuladoF)}`}>{formatInteger(fila.acumuladoF, fila.diario)}</td>
              <td className="py-3 px-5 border text-gray-500 whitespace-nowrap">{formatInteger(fila.proyectadoSuma, fila.diario)}</td>
              <td className="py-3 px-5 border text-gray-500 whitespace-nowrap">{formatInteger(fila.realSuma, fila.diario)}</td>
              <td className="py-3 px-5 border text-gray-500 whitespace-nowrap">{formatInteger(fila.trabajosNocturno, fila.diario)}</td>
              <td className="py-3 px-5 border text-gray-500 whitespace-nowrap">{formatInteger(fila.trabajosMat, fila.diario)}</td>
              <td className="py-3 px-5 border text-gray-500 whitespace-nowrap">{formatInteger(fila.trabajosVesp, fila.diario)}</td>
              <td className="py-3 px-5 border text-gray-500 whitespace-nowrap">{formatInteger(fila.asistenciaNocturno, fila.diario)}</td>
              <td className="py-3 px-5 border text-gray-500 whitespace-nowrap">{formatInteger(fila.asistenciaMat, fila.diario)}</td>
              <td className="py-3 px-5 border text-gray-500 whitespace-nowrap">{formatInteger(fila.asistenciaVesp, fila.diario)}</td>
              <td className={`py-3 px-5 border whitespace-nowrap ${getIndicadorColorClass(fila.indicadorNocturno)}`}>{formatNumber(fila.indicadorNocturno, fila.diario)}</td>
              <td className={`py-3 px-5 border whitespace-nowrap ${getIndicadorColorClass(fila.indicadorNocturnoMat)}`}>{formatNumber(fila.indicadorNocturnoMat, fila.diario)}</td>
              <td className={`py-3 px-5 border whitespace-nowrap ${getIndicadorColorClass(fila.indicadorVesp)}`}>{formatNumber(fila.indicadorVesp, fila.diario)}</td>
              <td className="py-3 px-5 border text-gray-500 whitespace-nowrap">{formatCurrency(fila.factProyect, fila.diario)}</td>
              <td className="py-3 px-5 border text-gray-500 whitespace-nowrap">{formatCurrency(fila.facturacionReal, fila.diario)}</td>
              <td className={`py-3 px-5 border whitespace-nowrap ${getColorClass(fila.diferencia2)}`}>{formatCurrency(fila.diferencia2, fila.diario)}</td>
              <td className={`py-3 px-5 border whitespace-nowrap ${getColorClass(fila.acumuladoMensual)}`}>{formatCurrency(fila.acumuladoMensual, fila.diario)}</td>
              <td className={`py-3 px-5 border whitespace-nowrap ${getColorClass(fila.acumuladoAnual)}`}>{formatCurrency(fila.acumuladoAnual, fila.diario)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TablaResumenResultado