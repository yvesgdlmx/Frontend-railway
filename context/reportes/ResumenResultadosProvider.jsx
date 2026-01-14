import React, { useState, useEffect, createContext } from "react";
import clienteAxios from "../../config/clienteAxios";
import Swal from 'sweetalert2';

const ResumenResultadosContext = createContext();

const ResumenResultadosProvider = ({ children }) => {
  const [datos, setDatos] = useState([]);
  const [todosLosDatos, setTodosLosDatos] = useState([]);
  const [porcentajesMensuales, setPorcentajesMensuales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPorcentajes, setLoadingPorcentajes] = useState(true);
  const [modalMetasDiariasOpen, setModalMetasDiariasOpen] = useState(false);
  const [modalAsistenciasOpen, setModalAsistenciasOpen] = useState(false);
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());

  // Función para obtener número de semana del año
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  const obtenerDatos = async (anio = anioSeleccionado) => {
    try {
      setLoading(true);
      
      const { data } = await clienteAxios.get(`/reportes/resumen_resultados/${anio}`);
      
      const fechaActual = new Date();
      fechaActual.setHours(0, 0, 0, 0);
      
      const registrosFiltrados = data.filter(registro => {
        const fechaRegistro = new Date(registro.diario + 'T00:00:00');
        return fechaRegistro <= fechaActual;
      });
      
      const datosOrdenados = [...registrosFiltrados].sort((a, b) => 
        new Date(a.diario) - new Date(b.diario)
      );

      let acumuladoSFMensual = 0;
      let acumuladoFMensual = 0;
      let acumuladoFacturacionMensual = 0;
      let acumuladoFacturacionAnual = 0;
      let acumuladoFacturacionQuincenal = 0;
      
      let mesActual = null;
      let anioActual = null;
      let quincenaActual = null;

      const datosMapeados = datosOrdenados.map(registro => {
        const fechaRegistro = new Date(registro.diario + 'T00:00:00');
        const mesRegistro = `${fechaRegistro.getFullYear()}-${fechaRegistro.getMonth()}`;
        const anioRegistro = fechaRegistro.getFullYear();
        
        const numeroSemana = getWeekNumber(fechaRegistro);
        const numeroQuincena = Math.ceil(numeroSemana / 2);
        const quincenaKey = `${fechaRegistro.getFullYear()}-${numeroQuincena}`;
        
        if (mesActual !== null && mesActual !== mesRegistro) {
          acumuladoSFMensual = 0;
          acumuladoFMensual = 0;
          acumuladoFacturacionMensual = 0;
        }
        
        if (anioActual !== null && anioActual !== anioRegistro) {
          acumuladoFacturacionAnual = 0;
        }

        if (quincenaActual !== null && quincenaActual !== quincenaKey) {
          acumuladoFacturacionQuincenal = 0;
        }
        
        mesActual = mesRegistro;
        anioActual = anioRegistro;
        quincenaActual = quincenaKey;

        const metaSF = registro.meta_sf || null;
        const metaF = registro.meta_f || null;
        const metaFacturacion = registro.fact_proyect || null;

        const diferenciaSF = registro.real_sf && metaSF 
          ? registro.real_sf - metaSF 
          : 0;
        
        const diferenciaF = registro.real_f && metaF 
          ? registro.real_f - metaF 
          : 0;

        acumuladoSFMensual += diferenciaSF;
        acumuladoFMensual += diferenciaF;

        const proyectadoSuma = (metaSF !== null && metaF !== null) 
          ? metaSF + metaF 
          : null;

        const diferenciaFacturacion = registro.facturacion_real && metaFacturacion
          ? parseFloat(registro.facturacion_real) - metaFacturacion
          : 0;

        acumuladoFacturacionMensual += diferenciaFacturacion;
        acumuladoFacturacionAnual += diferenciaFacturacion;
        acumuladoFacturacionQuincenal += diferenciaFacturacion;

        const indicadorNocturno = (registro.trabajos_nocturno > 0 && registro.asistencia_nocturno > 0)
          ? (registro.trabajos_nocturno / registro.asistencia_nocturno) / 8
          : null;

        const trabajosNocturnoMat = registro.trabajos_nocturno + registro.trabajos_mat;
        const asistenciaNocturnoMat = registro.asistencia_nocturno + registro.asistencia_mat;
        const indicadorNocturnoMat = (trabajosNocturnoMat > 0 && asistenciaNocturnoMat > 0)
          ? (trabajosNocturnoMat / asistenciaNocturnoMat) / 16
          : null;

        const indicadorVesp = (registro.trabajos_vesp > 0 && registro.asistencia_vesp > 0)
          ? (registro.trabajos_vesp / registro.asistencia_vesp) / 7
          : null;

        return {
          id: registro.id,
          semana: registro.semana,
          diario: registro.diario,
          quincena: numeroQuincena,
          metaSF,
          realSF: registro.real_sf,
          diferenciaSF,
          acumuladoSF: acumuladoSFMensual,
          metaF,
          realF: registro.real_f,
          diferenciaF,
          acumuladoF: acumuladoFMensual,
          proyectadoSuma,
          realSuma: registro.real_suma,
          trabajosNocturno: registro.trabajos_nocturno,
          trabajosMat: registro.trabajos_mat,
          trabajosVesp: registro.trabajos_vesp,
          asistenciaNocturno: registro.asistencia_nocturno,
          asistenciaMat: registro.asistencia_mat,
          asistenciaVesp: registro.asistencia_vesp,
          indicadorNocturno,
          indicadorNocturnoMat,
          indicadorVesp,
          factProyect: metaFacturacion,
          facturacionReal: registro.facturacion_real,
          diferencia2: diferenciaFacturacion,
          acumuladoMensual: acumuladoFacturacionMensual,
          acumuladoAnual: acumuladoFacturacionAnual,
          acumuladoQuincenal: acumuladoFacturacionQuincenal
        };
      });

      setDatos(datosMapeados);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error al obtener datos:', error);
      setLoading(false);
    }
  };

  const obtenerTodosLosDatos = async (anio = anioSeleccionado) => {
    try {
      const { data } = await clienteAxios.get(`/reportes/resumen_resultados/todos/${anio}`);

      const datosMapeados = data.map(registro => ({
        id: registro.id,
        semana: registro.semana,
        diario: registro.diario,
        metaSF: registro.meta_sf || 0,
        metaF: registro.meta_f || 0,
        factProyect: registro.fact_proyect || 0,
        realSF: registro.real_sf,
        realF: registro.real_f,
        trabajosNocturno: registro.trabajos_nocturno,
        trabajosMat: registro.trabajos_mat,
        trabajosVesp: registro.trabajos_vesp,
        asistenciaNocturno: registro.asistencia_nocturno,
        asistenciaMat: registro.asistencia_mat,
        asistenciaVesp: registro.asistencia_vesp
      }))

      setTodosLosDatos(datosMapeados);
    } catch (error) {
      console.error('❌ Error al obtener todos los datos:', error);
    }
  }

  const obtenerPorcentajesMensuales = async (anio = anioSeleccionado) => {
    try {
      setLoadingPorcentajes(true);
      const { data } = await clienteAxios.get(`/reportes/resumen_resultados/porcentajes/${anio}`);
      setPorcentajesMensuales(data);
      setLoadingPorcentajes(false);
    } catch (error) {
      console.error('❌ Error al obtener porcentajes mensuales:', error);
      setLoadingPorcentajes(false);
    }
  }

  useEffect(() => {
    obtenerDatos(anioSeleccionado);
    obtenerTodosLosDatos(anioSeleccionado);
    obtenerPorcentajesMensuales(anioSeleccionado);
  }, [anioSeleccionado]);

  const cambiarAnio = (nuevoAnio) => {
    setAnioSeleccionado(nuevoAnio);
  };

  const abrirModalMetasDiarias = () => setModalMetasDiariasOpen(true);
  const cerrarModalMetasDiarias = () => setModalMetasDiariasOpen(false);

  const abrirModalAsistencias = () => setModalAsistenciasOpen(true);
  const cerrarModalAsistencias = () => setModalAsistenciasOpen(false);

  const actualizarMetasDiarias = async (metas) => {
    try {
      console.log('📤 ENVIANDO METAS AL BACKEND:', metas);
      
      await clienteAxios.put('/reportes/actualizar_metas_diarias', metas);
      
      Swal.fire({
        icon: 'success',
        title: 'Metas actualizadas',
        text: 'Las metas del mes se han actualizado correctamente',
        timer: 2000,
        showConfirmButton: false
      });

      await obtenerDatos(anioSeleccionado);
      await obtenerTodosLosDatos(anioSeleccionado);
      await obtenerPorcentajesMensuales(anioSeleccionado);
      return true;
      
    } catch (error) {
      console.error('❌ Error al actualizar metas:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron actualizar las metas',
      });
      return false;
    }
  };

  const actualizarAsistencias = async (asistencias) => {
    try {
      console.log('📤 ENVIANDO ASISTENCIAS AL BACKEND:', asistencias);
      
      await clienteAxios.put('/reportes/actualizar_asistencias', asistencias);
      
      Swal.fire({
        icon: 'success',
        title: 'Asistencias actualizadas',
        text: 'Las asistencias se han actualizado correctamente',
        timer: 2000,
        showConfirmButton: false
      });

      await obtenerDatos(anioSeleccionado);
      await obtenerTodosLosDatos(anioSeleccionado);
      return true;
      
    } catch (error) {
      console.error('❌ Error al actualizar asistencias:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron actualizar las asistencias',
      });
      return false;
    }
  };

  return (
    <ResumenResultadosContext.Provider
      value={{
        datos,
        todosLosDatos,
        porcentajesMensuales,
        loading,
        loadingPorcentajes,
        modalMetasDiariasOpen,
        modalAsistenciasOpen,
        anioSeleccionado,
        obtenerDatos,
        obtenerTodosLosDatos,
        obtenerPorcentajesMensuales,
        cambiarAnio,
        abrirModalMetasDiarias,
        cerrarModalMetasDiarias,
        actualizarMetasDiarias,
        abrirModalAsistencias,
        cerrarModalAsistencias,
        actualizarAsistencias,
      }}
    >
      {children}
    </ResumenResultadosContext.Provider>
  );
};

export { ResumenResultadosProvider };
export default ResumenResultadosContext;