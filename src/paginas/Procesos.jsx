import React from 'react';
import Actualizacion from '../components/others/Actualizacion';
import Generado_Procesos from '../components/procesos/Generado_Procesos';
import Surtido_procesos from '../components/procesos/Surtido_procesos';
import Tallado_Procesos from '../components/procesos/Tallado_Procesos';
import Pulido_Procesos from '../components/procesos/Pulido_Procesos';
import Engraver_Procesos from '../components/procesos/Engraver_Procesos';
import AR_Procesos from '../components/procesos/AR_Procesos';
import Desbloqueo_Procesos from '../components/procesos/Desbloqueo_Procesos';
import Terminado_Procesos from '../components/procesos/Terminado_Procesos';
import Biselado_Procesos from '../components/procesos/Biselado_Procesos';
import Produccion_Procesos from '../components/procesos/Produccion_Procesos';
import HardCoat_Procesos from '../components/procesos/HardCoat_Procesos';
import Recubrimiento_Procesos from '../components/procesos/Recubrimiento_Procesos';

const Procesos = () => {
  return (
    <div>
      <Actualizacion />
      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-2 mt-6">
        <Surtido_procesos />
        <Tallado_Procesos />
        <Generado_Procesos />
        <Pulido_Procesos />
        <Engraver_Procesos />
        <AR_Procesos />
        <HardCoat_Procesos />
        <Recubrimiento_Procesos />
        <Desbloqueo_Procesos />
        <Terminado_Procesos />
        <Biselado_Procesos />
        <Produccion_Procesos />
      </div>
    </div>
  );
};
export default Procesos;