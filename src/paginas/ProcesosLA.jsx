import React from 'react';
import Actualizacion from '../components/others/Actualizacion';
import Generado_Procesos_LA from '../components/procesos/procesosLA/Generado_Procesos_LA';
import Pulido_Procesos_LA from '../components/procesos/procesosLA/Pulido_Procesos_LA';
import Biselado_Procesos_LA from '../components/procesos/procesosLA/Biselado_Procesos_LA';


const ProcesosLA = () => {
  return (
    <div>
      <Actualizacion />
      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-2 mt-6">
        <Generado_Procesos_LA />
        <Pulido_Procesos_LA/>
        <Biselado_Procesos_LA/>
      </div>
    </div>
  );
};
export default ProcesosLA;