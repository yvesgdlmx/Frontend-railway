import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './layouts/Layout';
import ScrollToTop from './components/others/ScrollToTop';
import { AuthProvider } from '../context/AuthProvider';
import AuthLayout from './layouts/AuthLayout';

// Usar React.lazy para cargar componentes de forma asíncrona
const Login = lazy(() => import('./components/others/Login'));
const Procesos = lazy(() => import('./paginas/Procesos'));
const Totales_Estacion = lazy(() => import('./paginas/totales/Totales_Estacion'));
const Totales_Surtido_Maquina = lazy(() => import('./components/totales_maquina/Totales_Surtido_Maquina'));
const Totales_Generado_Maquina = lazy(() => import('./components/totales_maquina/Totales_Generado_Maquina'));
const Totales_Pulido_Maquina = lazy(() => import('./components/totales_maquina/Totales_Pulido_Maquina'));
const Totales_Tallado_Maquina = lazy(() => import('./components/totales_maquina/Totales_Tallado_Maquina'));
const Totales_Engraver_Maquina = lazy(() => import('./components/totales_maquina/Totales_Engraver_Maquina'));
const Totales_Terminado_Maquina = lazy(() => import('./components/totales_maquina/Totales_Terminado_Maquina'));
const Totales_Biselado_Maquina = lazy(() => import('./components/totales_maquina/Totales_Biselado_Maquina'));
const Totales_Produccion_Maquina = lazy(() => import('./components/totales_maquina/Totales_Produccion_Maquina'));
const Totales_AR_Maquina = lazy(() => import('./components/totales_maquina/Totales_AR_Maquina'));
const Totales_Desbloqueo_Maquina = lazy(() => import('./components/totales_maquina/Totales_Desbloqueo_Maquina'));
const Totales_HardCoat_Maquina = lazy(() => import('./components/totales_maquina/Totales_HardCoat_Maquina'));
const Totales_Recubrimiento_Maquina = lazy(() => import('./components/totales_maquina/Totales_Recubrimiento_Maquina'));
const Surtido_Detallado = lazy(() => import('./components/totales_maquina/totales_detallados/Surtido_Detallado'));
const Manuales_Metas = lazy(() => import('./paginas/metas/Manuales_Metas'));
const Tallado_Metas = lazy(() => import('./paginas/metas/Tallado_Metas'));
const Generado_Metas = lazy(() => import('./paginas/metas/Generado_Metas'));
const Pulido_Metas = lazy(() => import('./paginas/metas/Pulido_Metas'));
const Engraver_Metas = lazy(() => import('./paginas/metas/Engraver_Metas'));
const Terminado_Metas = lazy(() => import('./paginas/metas/Terminado_Metas'));
const Biselado_Metas = lazy(() => import('./paginas/metas/Biselado_Metas'));
const Editar_Tallado = lazy(() => import('./paginas/metas/editar/Editar_Tallado'));
const Editar_Generado = lazy(() => import('./paginas/metas/editar/Editar_Generado'));
const Editar_Pulido = lazy(() => import('./paginas/metas/editar/Editar_Pulido'));
const Editar_Engraver = lazy(() => import('./paginas/metas/editar/Editar_Engraver'));
const Editar_Terminado = lazy(() => import('./paginas/metas/editar/Editar_Terminado'));
const Editar_Biselado = lazy(() => import('./paginas/metas/editar/Editar_Biselado'));
const Editar_Manuales = lazy(() => import('./paginas/metas/editar/Editar_Manuales'));
const Historial_Por_Rangos = lazy(() => import('./paginas/historial/Historial_Por_Rangos'));
const Historial_Por_Dia = lazy(() => import('./paginas/historial/Historial_Por_Dia'));
const Tableros_Tallado = lazy(() => import('./paginas/tableros/Tableros_Tallado'));
const Tableros_Terminado = lazy(() => import('./paginas/tableros/Tableros_Terminado'));
const Tableros_Tallado_Terminado = lazy(() => import('./paginas/tableros/Tableros_Tallado_Terminado'));
const Reporte = lazy(() => import('./paginas/reportes/Reporte'));
const ReporteAntiguedad = lazy(() => import('./paginas/reportes/ReporteAntiguedad'));
const ReporteTrabajosNuevos = lazy(() => import('./paginas/reportes/ReporteTrabajosNuevos'));
const ReporteWipDiario = lazy(() => import('./paginas/reportes/ReporteWipDiario'));
const ReportesTrabajosEnviados = lazy(() => import('./paginas/reportes/ReportesTrabajosEnviados'));
const ResumenTrabajo = lazy(() => import('./paginas/reportes/ResumenTrabajo'));
const Facturas =  lazy(() => import('./paginas/finanzas/Facturas'));
const HistorialFacturas = lazy(() => import('./paginas/finanzas/HistorialFacturas'))
const ReporteTrabajosSinMovimientos = lazy(() => import('./paginas/reportes/ReporteTrabajosSinMovimientos'));
const MermaPorHora = lazy(() => import('./paginas/mermas/MermaPorHora'));
const CargarMedia = lazy(() => import('./paginas/CargarMedia'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Suspense fallback={<div>Cargando...</div>}>
          <Routes>
            <Route path='/' element={<Layout />}>
              <Route index element={<Procesos />} />
              <Route path='/totales_estacion' element={<Totales_Estacion />} />
              <Route path='/totales_surtido_maquina' element={<Totales_Surtido_Maquina />} />
              <Route path='/totales_generado_maquina' element={<Totales_Generado_Maquina />} />
              <Route path='/totales_pulido_maquina' element={<Totales_Pulido_Maquina />} />
              <Route path='/totales_ar_maquina' element={<Totales_AR_Maquina />} />
              <Route path='/totales_hardcoat_maquina' element={<Totales_HardCoat_Maquina />} />
              <Route path='/totales_recubrimiento_maquina' element={<Totales_Recubrimiento_Maquina />} />
              <Route path='/totales_desblocking_maquina' element={<Totales_Desbloqueo_Maquina />} />
              <Route path='/totales_tallado_maquina' element={<Totales_Tallado_Maquina />} />
              <Route path='/totales_engraver_maquina' element={<Totales_Engraver_Maquina />} />
              <Route path='/totales_terminado_maquina' element={<Totales_Terminado_Maquina />} />
              <Route path='/totales_biselado_maquina' element={<Totales_Biselado_Maquina />} />
              <Route path='/totales_produccion_maquina' element={<Totales_Produccion_Maquina />} />
              <Route path='/surtido_detallado' element={<Surtido_Detallado />} />
              <Route path='/manuales_metas' element={<Manuales_Metas />} />
              <Route path='/tallado_metas' element={<Tallado_Metas />} />
              <Route path='/generado_metas' element={<Generado_Metas />} />
              <Route path='/pulido_metas' element={<Pulido_Metas />} />
              <Route path='/engraver_metas' element={<Engraver_Metas />} />
              <Route path='/terminado_metas' element={<Terminado_Metas />} />
              <Route path='/biselado_metas' element={<Biselado_Metas />} />
              <Route path='/editar_tallado/:id' element={<Editar_Tallado />} />
              <Route path='/editar_generado/:id' element={<Editar_Generado />} />
              <Route path='/editar_pulido/:id' element={<Editar_Pulido />} />
              <Route path='/editar_engraver/:id' element={<Editar_Engraver />} />
              <Route path='/editar_terminado/:id' element={<Editar_Terminado />} />
              <Route path='/editar_biselado/:id' element={<Editar_Biselado />} />
              <Route path='/editar_manuales/:id' element={<Editar_Manuales />} />
              <Route path='/historial_por_rangos' element={<Historial_Por_Rangos />} />
              <Route path='/historial_por_dia' element={<Historial_Por_Dia />} />
              <Route path='/tableros_tallado' element={<Tableros_Tallado />} />
              <Route path='/tableros_terminado' element={<Tableros_Terminado />} />
              <Route path='/tableros_tallado_terminado' element={<Tableros_Tallado_Terminado />} />
              <Route path='/reportes' element={<Reporte />} />
              <Route path='/reportes_antiguedad' element={<ReporteAntiguedad />} />
              <Route path='/reportes_trabajos_nuevos' element={<ReporteTrabajosNuevos />} />
              <Route path='/reportes_wip_diario' element={<ReporteWipDiario />} />
              <Route path='/reportes_trabajos_enviados' element={<ReportesTrabajosEnviados />} />
              <Route path='/reportes_resumen_trabajo' element={<ResumenTrabajo/>} />
              <Route path='/reportes_trabajos_sin_movimientos' element={<ReporteTrabajosSinMovimientos/>} />
              <Route path='/finanzas_facturas' element={<Facturas/>} />
              <Route path='/historial_facturas' element={<HistorialFacturas/>} />
              <Route path='/mermas_por_hora' element={<MermaPorHora/>} />
              <Route path='/cargar_media' element={<CargarMedia/>} />
            </Route>
            <Route path='/auth' element={<AuthLayout />}>
              <Route index element={<Login />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;