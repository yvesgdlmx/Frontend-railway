import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Layout from './layouts/Layout';
import Procesos from './paginas/Procesos';
import ScrollToTop from './components/others/ScrollToTop';
/*Totales estacion*/
import Totales_Estacion from './paginas/totales/Totales_Estacion';
/*Totales maquina*/
import Totales_Surtido_Maquina from './components/totales_maquina/Totales_Surtido_Maquina';
import Totales_Generado_Maquina from './components/totales_maquina/Totales_Generado_Maquina';
import Totales_Pulido_Maquina from './components/totales_maquina/Totales_Pulido_Maquina';
import Totales_Tallado_Maquina from './components/totales_maquina/Totales_Tallado_Maquina';
import Totales_Engraver_Maquina from './components/totales_maquina/Totales_Engraver_Maquina';
import Totales_Terminado_Maquina from './components/totales_maquina/Totales_Terminado_Maquina';
import Totales_Biselado_Maquina from './components/totales_maquina/Totales_Biselado_Maquina';
import Totales_Produccion_Maquina from './components/totales_maquina/Totales_Produccion_Maquina';
import Totales_AR_Maquina from './components/totales_maquina/Totales_AR_Maquina';
import Totales_Desbloqueo_Maquina from './components/totales_maquina/Totales_Desbloqueo_Maquina';
import Totales_HardCoat_Maquina from './components/totales_maquina/Totales_HardCoat_Maquina';
import Totales_Recubrimiento_Maquina from './components/totales_maquina/Totales_Recubrimiento_Maquina';
/*Metas*/
import Surtido_Metas from './paginas/metas/Surtido_Metas';
import Tallado_Metas from './paginas/metas/Tallado_Metas';
import Generado_Metas from './paginas/metas/Generado_Metas';
import Pulido_Metas from './paginas/metas/Pulido_Metas';
import Engraver_Metas from './paginas/metas/Engraver_Metas';
import Terminado_Metas from './paginas/metas/Terminado_Metas';
import Biselado_Metas from './paginas/metas/Biselado_Metas';
/*Editar Metas*/
import Editar_Tallado from './paginas/metas/editar/Editar_Tallado';
import Editar_Generado from './paginas/metas/editar/Editar_Generado';
import Editar_Pulido from './paginas/metas/editar/Editar_Pulido';
import Editar_Engraver from './paginas/metas/editar/Editar_Engraver';
import Editar_Terminado from './paginas/metas/editar/Editar_Terminado';
import Editar_Biselado from './paginas/metas/editar/Editar_Biselado';
/*Historial*/
import Historial_Por_Rangos from './paginas/historial/Historial_Por_Rangos';
import Historial_Por_Dia from './paginas/historial/Historial_Por_Dia';
/*Tableros*/
import Tableros_Tallado from './paginas/tableros/Tableros_Tallado';
import Tableros_Terminado from './paginas/tableros/Tableros_Terminado';
import Tableros_Tallado_Terminado from './paginas/tableros/Tableros_Tallado_Terminado';
/*AUTH*/
import AuthLayout from './layouts/AuthLayout';
import Login from './components/others/Login';
import { AuthProvider } from '../context/AuthProvider';
/* Reportes */
import Reporte from './paginas/reportes/Reporte';
import ReporteTrabajosNuevos from './paginas/reportes/ReporteTrabajosNuevos'
import ReporteAntiguedad from './paginas/reportes/ReporteAntiguedad';

function App() {

  return (
    <>
      <Router>
        <AuthProvider>
            <ScrollToTop />
              <Routes>
                  <Route path='/' element={<Layout/>}>
                      <Route index element={<Procesos/>} />
                      <Route path='/totales_estacion' element={<Totales_Estacion/>}/>
                      <Route path='/totales_surtido_maquina' element={<Totales_Surtido_Maquina/>}/>
                      <Route path='/totales_generado_maquina' element={<Totales_Generado_Maquina/>}/>
                      <Route path='/totales_pulido_maquina' element={<Totales_Pulido_Maquina/>} />
                      <Route path='/totales_ar_maquina' element={<Totales_AR_Maquina/>}/>
                      <Route path='/totales_hardcoat_maquina' element={<Totales_HardCoat_Maquina/>} />
                      <Route path='/totales_recubrimiento_maquina' element={<Totales_Recubrimiento_Maquina/>}/>
                      <Route path='/totales_desblocking_maquina' element={<Totales_Desbloqueo_Maquina/>}/>
                      <Route path='/totales_tallado_maquina' element={<Totales_Tallado_Maquina/>}/>
                      <Route path='/totales_engraver_maquina' element={<Totales_Engraver_Maquina/>}/>
                      <Route path='/totales_terminado_maquina' element={<Totales_Terminado_Maquina/>}/>
                      <Route path='/totales_biselado_maquina' element={<Totales_Biselado_Maquina/>}/>
                      <Route path='/totales_produccion_maquina' element={<Totales_Produccion_Maquina/>}/>
                      <Route path='/surtido_metas' element={<Surtido_Metas/>}/>
                      <Route path='/tallado_metas' element={<Tallado_Metas/>}/>
                      <Route path='/generado_metas' element={<Generado_Metas/>}/>
                      <Route path='/pulido_metas' element={<Pulido_Metas/>} />
                      <Route path='/engraver_metas' element={<Engraver_Metas/>} />
                      <Route path='/terminado_metas' element={<Terminado_Metas/>}/>
                      <Route path='/biselado_metas' element={<Biselado_Metas/>}/>
                      <Route path='/editar_tallado/:id' element={<Editar_Tallado/>} />
                      <Route path='/editar_generado/:id' element={<Editar_Generado/>} />
                      <Route path='/editar_pulido/:id' element={<Editar_Pulido/>} />
                      <Route path='/editar_engraver/:id' element={<Editar_Engraver/>}/>
                      <Route path='/editar_terminado/:id' element={<Editar_Terminado/>} />
                      <Route path='/editar_biselado/:id' element={<Editar_Biselado/>}/>
                      <Route path='/historial_por_rangos' element={<Historial_Por_Rangos/>} />
                      <Route path='/historial_por_dia' element={<Historial_Por_Dia/>} />
                      <Route path='/tableros_tallado' element={<Tableros_Tallado/>}/>
                      <Route path='/tableros_terminado' element={<Tableros_Terminado/>}/>
                      <Route path='/tableros_tallado_terminado' element={<Tableros_Tallado_Terminado/>}/>
                      <Route path='/reportes' element={<Reporte/>} />
                      <Route path='/reportes_antiguedad' element={<ReporteAntiguedad/>} />
                      <Route path='/reportes_trabajos_nuevos' element={<ReporteTrabajosNuevos/>} />
                  </Route>
                  <Route path='/auth' element={<AuthLayout/>}>
                    <Route index element={<Login/>}/>
                  </Route>
              </Routes>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App