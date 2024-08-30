import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Layout from '../layouts/Layout';
import Tablas from '../paginas/Tablas';
import Graficas from '../paginas/Graficas';
import TodosRegistros from '../paginas/TodosRegistros';
import Procesos from '../paginas/Procesos';
import ProcesosHora from '../paginas/ProcesosHora';
import GeneradoMaquina from '../paginas/GeneradoMaquina';
import GeneradoresHora from '../paginas/GeneradoresHora';
import PulidorasHora from '../paginas/PulidorasHora';
import TalladosHora from '../paginas/TalladosHora';
import EngraversHoras from '../paginas/EngraversHoras';
import DesblockingHoras from '../paginas/DesblockingHoras';
import ARHoras from '../paginas/ARHoras';
import TerminadosHoras from '../paginas/TerminadosHoras';
import BiseladorasHoras from '../paginas/BiseladorasHoras';
import ManualesHoras from '../paginas/ManualesHoras';
import LensLogHoras from '../paginas/LensLogHoras';
import JobCompletesHoras from '../paginas/JobCompletesHoras';
/* Metas */
import Metas from '../paginas/Metas';
import BloqueoTallado from '../paginas/metas/BloqueoTallado';
import Generadores from '../paginas/metas/Generadores';
import Generadores2 from '../paginas/metas/Generadores2';
import Pulidoras from '../paginas/metas/Pulidoras';
import Engraver from '../paginas/metas/Engraver';
import BloqueoTerminado from '../paginas/metas/BloqueoTerminado';
import Biseladoras from '../paginas/metas/Biseladoras';
import Manuales from '../paginas/metas/Manuales';
/*Ediciones de metas*/
import EditarTallado from '../paginas/metas/EditarTallado';
import EditarMeta from '../paginas/metas/EditarMeta';
import EditarPulido from '../paginas/metas/EditarPulido';
import EditarEngraver from '../paginas/metas/EditarEngraver';
import EditarTerminado from '../paginas/metas/EditarTerminado';
import EditarBiselado from '../paginas/metas/EditarBiselado';
import ScrollToTop from '../components/ScrollToTop';
import './index.css';
/* Tableros */
import Tableros from '../paginas/tableros/Tableros';
import TablerosTallado from '../paginas/tableros/TablerosTallado';
import TablerosTerminado from '../paginas/tableros/TablerosTerminado';
import TablerosTalladoTerminado from '../paginas/tableros/TablerosTalladoTerminado';

/* Historial */
import HistorialPorHora from '../paginas/historial/HistorialPorHora';
import HistorialPorTurnos from '../paginas/historial/HistorialPorTurnos';
import HistorialIndex from '../paginas/historial/HistorialIndex';
import HistorialPorRangos from '../paginas/historial/HistorialPorRangos';

/* Auth */
import Login from '../paginas/Login';
import AuthLayout from '../layouts/AuthLayout';
import { AuthProvider } from '../context/AuthProvider';

function App() {

  return (
    <>
      <Router>
          <AuthProvider>
            <ScrollToTop />
              <Routes>
                  <Route path='/' element={<Layout/>}>
                      <Route index element={<Procesos/>} />
                      <Route path='/procesos-horas' element={<ProcesosHora/>} />
                      <Route path='/tallados-horas' element={<TalladosHora/>} />
                      <Route path='/generadores-horas' element={<GeneradoresHora/>} />
                      <Route path='/pulidoras-horas' element={<PulidorasHora/>} />
                      <Route path='/engravers-horas' element={<EngraversHoras/>} />
                      <Route path='/desblocking-horas' element={<DesblockingHoras/>} />
                      <Route path='ar-horas' element={<ARHoras/>} />
                      <Route path='/terminados-horas' element={<TerminadosHoras/>} />
                      <Route path='/biselados-horas' element={<BiseladorasHoras/>} />
                      <Route path='/lenslog-horas' element={<LensLogHoras/>} />
                      <Route path='/jobcomplete-horas' element={<JobCompletesHoras/>} />
                      <Route path='/manuales-horas' element={<ManualesHoras/>} />
                      <Route path='/generado-maquina/:anio/:mes/:dia/:hora' element={<GeneradoMaquina/>} />
                      <Route path='/metas' element={<Metas/>} />
                      <Route path='/meta-tallado' element={<BloqueoTallado/>} />
                      <Route path='/meta-generado' element={<Generadores2/>} />
                      <Route path='/meta-pulido' element={<Pulidoras/>} />
                      <Route path='/meta-engraver' element={<Engraver/>} />
                      <Route path='/meta-terminado' element={<BloqueoTerminado/>} />
                      <Route path='/meta-biselado' element={<Biseladoras/>} />
                      <Route path='/meta-manual' element={<Manuales/>} />
                      <Route path='/editar-meta/:id' element={<EditarMeta/>} />
                      <Route path='/editar-tallado/:id' element={<EditarTallado/>} />
                      <Route path='/editar-pulido/:id' element={<EditarPulido/>} />
                      <Route path='/editar-engraver/:id' element={<EditarEngraver/>} />
                      <Route path='/editar-terminado/:id' element={<EditarTerminado/>} />
                      <Route path='/editar-biselado/:id' element={<EditarBiselado/>} />
                      <Route path='/registros' element={<TodosRegistros/>} />
                      <Route path='/graficas' element={<Graficas/>} />
                      <Route path='/tablas' element={<Tablas/>} />
                      <Route path='/tableros' element={<Tableros/>}/>
                      <Route path='/tableros-tallado' element={<TablerosTallado/>} />
                      <Route path='/tableros-terminado' element= {<TablerosTerminado/>} />
                      <Route path='/tableros-tallado&terminado' element={<TablerosTalladoTerminado/>}/>
                      <Route path='/historial-index' element={<HistorialIndex/>} />
                      <Route path='/historial' element={<HistorialPorHora/>} />
                      <Route path='/historial-turnos' element={<HistorialPorTurnos/>} />
                      <Route path='/historial-rangos' element={<HistorialPorRangos/>}/>
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