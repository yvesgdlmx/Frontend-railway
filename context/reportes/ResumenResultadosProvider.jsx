import React, { useState, useEffect, createContext } from "react";
import clienteAxios from "../../config/clienteAxios";
import Swal from 'sweetalert2';

const ResumenResultadosContext = createContext();

const ResumenResultadosProvider = ({ children }) => {
  const [datos, setDatos] = useState([]);
  const [todosLosDatos, setTodosLosDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMetasDiariasOpen, setModalMetasDiariasOpen] = useState(false);
  const [modalAsistenciasOpen, setModalAsistenciasOpen] = useState(false);

  const obtenerDatos = async () => {
    try {
      setLoading(true);
      
      // Obtener datos de resumen
      const { data } = await clienteAxios.get('/reportes/resumen_resultados');
      
      // 🆕 FILTRAR SOLO REGISTROS HASTA HOY (INCLUSIVE)
      const fechaActual = new Date();
      fechaActual.setHours(0, 0, 0, 0); // Resetear a medianoche para comparación exacta
      
      const registrosFiltrados = data.filter(registro => {
        const fechaRegistro = new Date(registro.diario + 'T00:00:00');
        return fechaRegistro <= fechaActual; // Solo registros <= fecha actual
      });
      
      // Ordenar por fecha para calcular correctamente
      const datosOrdenados = [...registrosFiltrados].sort((a, b) => 
        new Date(a.diario) - new Date(b.diario)
      );

      // Variables para acumulados
      let acumuladoSFMensual = 0;
      let acumuladoFMensual = 0;
      let acumuladoFacturacionMensual = 0;
      let acumuladoFacturacionAnual = 0;
      
      let mesActual = null;
      let anioActual = null;

      // Mapear los datos de la API a la estructura que espera la tabla
      const datosMapeados = datosOrdenados.map(registro => {
        const fechaRegistro = new Date(registro.diario + 'T00:00:00');
        const mesRegistro = `${fechaRegistro.getFullYear()}-${fechaRegistro.getMonth()}`;
        const anioRegistro = fechaRegistro.getFullYear();
        
        // Reiniciar acumulados mensuales si cambió el mes
        if (mesActual !== null && mesActual !== mesRegistro) {
          acumuladoSFMensual = 0;
          acumuladoFMensual = 0;
          acumuladoFacturacionMensual = 0;
        }
        
        // Reiniciar acumulado anual si cambió el año
        if (anioActual !== null && anioActual !== anioRegistro) {
          acumuladoFacturacionAnual = 0;
        }
        
        mesActual = mesRegistro;
        anioActual = anioRegistro;

        // AHORA LAS METAS VIENEN DIRECTAMENTE DEL REGISTRO
        const metaSF = registro.meta_sf || null;
        const metaF = registro.meta_f || null;
        const metaFacturacion = registro.fact_proyect || null;

        // Calcular diferencias SF y F
        const diferenciaSF = registro.real_sf && metaSF 
          ? registro.real_sf - metaSF 
          : 0;
        
        const diferenciaF = registro.real_f && metaF 
          ? registro.real_f - metaF 
          : 0;

        // Sumar al acumulado mensual SF y F
        acumuladoSFMensual += diferenciaSF;
        acumuladoFMensual += diferenciaF;

        // Calcular proyectadoSuma (META SF + META F)
        const proyectadoSuma = (metaSF !== null && metaF !== null) 
          ? metaSF + metaF 
          : null;

        // Calcular diferencia de facturación
        const diferenciaFacturacion = registro.facturacion_real && metaFacturacion
          ? parseFloat(registro.facturacion_real) - metaFacturacion
          : 0;

        // Sumar al acumulado mensual y anual de facturación
        acumuladoFacturacionMensual += diferenciaFacturacion;
        acumuladoFacturacionAnual += diferenciaFacturacion;

        // CÁLCULO DE INDICADORES DE PRODUCTIVIDAD
        
        // Indicador Nocturno = (Trabajos Nocturno / Asistencia Nocturno) / 8 horas
        const indicadorNocturno = (registro.trabajos_nocturno > 0 && registro.asistencia_nocturno > 0)
          ? (registro.trabajos_nocturno / registro.asistencia_nocturno) / 8
          : null;

        // Indicador Matutino = (Trabajos Mat / Asistencia Mat) / 8 horas
        const indicadorMat = (registro.trabajos_mat > 0 && registro.asistencia_mat > 0)
          ? (registro.trabajos_mat / registro.asistencia_mat) / 8
          : null;

        // Indicador Vespertino = (Trabajos Vesp / Asistencia Vesp) / 7 horas
        const indicadorVesp = (registro.trabajos_vesp > 0 && registro.asistencia_vesp > 0)
          ? (registro.trabajos_vesp / registro.asistencia_vesp) / 7
          : null;

        const registroMapeado = {
          id: registro.id,
          semana: registro.semana,
          diario: registro.diario,
          metaSF: metaSF,
          realSF: registro.real_sf,
          diferenciaSF: diferenciaSF,
          acumuladoSF: acumuladoSFMensual,
          metaF: metaF,
          realF: registro.real_f,
          diferenciaF: diferenciaF,
          acumuladoF: acumuladoFMensual,
          proyectadoSuma: proyectadoSuma,
          realSuma: registro.real_suma,
          trabajosNocturno: registro.trabajos_nocturno,
          trabajosMat: registro.trabajos_mat,
          trabajosVesp: registro.trabajos_vesp,
          asistenciaNocturno: registro.asistencia_nocturno,
          asistenciaMat: registro.asistencia_mat,
          asistenciaVesp: registro.asistencia_vesp,
          indicadorNocturno: indicadorNocturno,
          indicadorMat: indicadorMat,
          indicadorVesp: indicadorVesp,
          factProyect: metaFacturacion,
          facturacionReal: registro.facturacion_real,
          diferencia2: diferenciaFacturacion,
          acumuladoMensual: acumuladoFacturacionMensual,
          acumuladoAnual: acumuladoFacturacionAnual
        };

        return registroMapeado;
      });

      setDatos(datosMapeados);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error al obtener datos:', error);
      setLoading(false);
    }
  };

  const obtenerTodosLosDatos = async () => {
    try {
      const { data } = await clienteAxios.get('/reportes/resumen_resultados/todos');

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
        trabajosVesp: registro.trabajosVesp,
        asistenciaNocturno: registro.asistencia_nocturno,
        asistenciaMat: registro.asistencia_mat,
        asistenciaVesp: registro.asistenciaVesp
      }))

      setTodosLosDatos(datosMapeados);
    } catch (error) {
      console.error('❌ Error al obtener todos los datos:', error);
    }
  }

  useEffect(() => {
    obtenerDatos();
    obtenerTodosLosDatos();
  }, []);

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

      await obtenerDatos();
      await obtenerTodosLosDatos();
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

      await obtenerDatos();
      await obtenerTodosLosDatos();
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
        // Estados
        datos,
        todosLosDatos,
        loading,
        modalMetasDiariasOpen,
        modalAsistenciasOpen,
        // Funciones
        obtenerDatos,
        obtenerTodosLosDatos,
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