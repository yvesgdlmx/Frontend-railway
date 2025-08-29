import { useContext } from "react";
import BiseladoEstacionContext from "../../context/estacion/BiseladoEstacionProvider";
const useBiseladoEstacion = () => {
  return useContext(BiseladoEstacionContext);
};
export default useBiseladoEstacion;