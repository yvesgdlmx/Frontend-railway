import { useContext } from "react";
import PulidoEstacionLAContext from "../../context/estacionLA/PulidoEstacionLAContext";
const usePulidoLAEstacion = () => {
  return useContext(PulidoEstacionLAContext);
};
export default usePulidoLAEstacion;