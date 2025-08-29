import { useContext } from "react";
import BiseladoEstacionLAContext from "../../context/estacionLA/BiseladoEstacionLAContext";
const useBiseladoLAEstacion = () => {
  return useContext(BiseladoEstacionLAContext);
};
export default useBiseladoLAEstacion;