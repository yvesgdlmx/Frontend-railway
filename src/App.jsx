import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './layouts/Layout';
import ScrollToTop from './components/others/ScrollToTop';
import { AuthProvider } from '../context/AuthProvider';
import AuthLayout from './layouts/AuthLayout';
import Totales_Surtido_Maquina2 from './components/totales_maquina/Totales_Surtido_Maquina2';
import Totales_Tallado_Maquina2 from './components/totales_maquina/Totales_Tallado_Maquina2';
import Totales_Generado_Maquina2 from './components/totales_maquina/Totales_Generado_Maquina2';
import Totales_Pulido_Maquina2 from './components/totales_maquina/Totales_Pulido_Maquina2';
import Totales_Engraver_Maquina2 from './components/totales_maquina/Totales_Engraver_Maquina2';
import Totales_AR_Maquina2 from './components/totales_maquina/Totales_AR_Maquina2';
import Totales_HardCoat_Maquina2 from './components/totales_maquina/Totales_HardCoat_Maquina2';
import Totales_Recubrimiento_Maquina2 from './components/totales_maquina/Totales_Recubrimiento_Maquina2';
import Totales_Desbloqueo_Maquina2 from './components/totales_maquina/Totales_Desbloqueo_Maquina2';
import Totales_Terminado_Maquina2 from './components/totales_maquina/Totales_Terminado_Maquina2';
import Totales_Biselado_Maquina2 from './components/totales_maquina/Totales_Biselado_Maquina2';
import Totales_Produccion_Maquina2 from './components/totales_maquina/Totales_Produccion_Maquina2';


// Usar React.lazy para cargar componentes de forma asíncrona
const Login = lazy(() => import('./components/others/Login'));
const Procesos = lazy(() => import('./paginas/Procesos'));
const Totales_Estacion = lazy(() => import('./paginas/totales/Totales_Estacion'));
const Surtido_Detallado = lazy(() => import('./components/totales_maquina/totales_detallados/Surtido_Detallado'));
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
              <Route path='/totales_surtido_maquina' element={<Totales_Surtido_Maquina2 />} />
              <Route path='/totales_tallado_maquina' element={<Totales_Tallado_Maquina2 />} />
              <Route path='/totales_generado_maquina' element={<Totales_Generado_Maquina2 />} />
              <Route path='/totales_pulido_maquina' element={<Totales_Pulido_Maquina2 />} />
              <Route path='/totales_engraver_maquina' element={<Totales_Engraver_Maquina2 />} />
              <Route path='/totales_ar_maquina' element={<Totales_AR_Maquina2 />} />
              <Route path='/totales_hardcoat_maquina' element={<Totales_HardCoat_Maquina2 />} />
              <Route path='/totales_recubrimiento_maquina' element={<Totales_Recubrimiento_Maquina2 />} />
              <Route path='/totales_desblocking_maquina' element={<Totales_Desbloqueo_Maquina2 />} />
              <Route path='/totales_terminado_maquina' element={<Totales_Terminado_Maquina2 />} />
              <Route path='/totales_biselado_maquina' element={<Totales_Biselado_Maquina2 />} />
              <Route path='/totales_produccion_maquina' element={<Totales_Produccion_Maquina2 />} />
              <Route path='/surtido_detallado' element={<Surtido_Detallado />} />
              <Route path='/editar_metas' element={<EditarMetas/>}/>
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