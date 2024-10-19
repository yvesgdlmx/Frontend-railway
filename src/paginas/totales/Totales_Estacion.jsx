import { useEffect } from "react";
import Totales_Surtido_Estacion from "../../components/totales_estacion/Totales_Surtido_Estacion";
import Totales_Tallado_Estacion from "../../components/totales_estacion/Totales_Tallado_Estacion";
import Totales_Generado_Estacion from "../../components/totales_estacion/Totales_Generado_Estacion";
import Totales_Pulido_Estacion from "../../components/totales_estacion/Totales_Pulido_Estacion";
import Totales_Engraver_Estacion from "../../components/totales_estacion/Totales_Engraver_Estacion";
import Totales_Terminado_Estacion from "../../components/totales_estacion/Totales_Terminado_Estacion";
import Totales_Biselado_Estacion from "../../components/totales_estacion/Totales_Biselado_Estacion";
import Totales_AR_Estacion from "../../components/totales_estacion/Totales_AR_Estacion";
import Totales_Desbloqueo_Estacion from "../../components/totales_estacion/Totales_Desbloqueo_Estacion";
import Totales_Produccion_Estacion from "../../components/totales_estacion/Totales_Produccion_Estacion";

const Totales_Estacion = () => {

    useEffect(() => {
        const interval = setInterval(() => {
          window.location.reload();
        }, 300000); // Actualiza cada 5 minutos
        return () => clearInterval(interval);
      }, []);

    return (
        <>
        <div className="flex flex-col gap-8 min-w-full mt-6">
            <div>
                <Totales_Surtido_Estacion/>
            </div>
            <div>
                <Totales_Tallado_Estacion/>
            </div>
            <div>
                <Totales_Generado_Estacion/>
            </div>
            <div>
                <Totales_Pulido_Estacion/>
            </div>
            <div>
                <Totales_Engraver_Estacion/>
            </div>
            <div>
                <Totales_Desbloqueo_Estacion/>
            </div>
            <div>
                <Totales_AR_Estacion/>
            </div>
            <div>
                <Totales_Terminado_Estacion/>
            </div>
            <div>
                <Totales_Biselado_Estacion/>
            </div>
            <div>
                <Totales_Produccion_Estacion/>
            </div>
        </div>
        </>
    )

};

export default Totales_Estacion;