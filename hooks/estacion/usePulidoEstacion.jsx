import { useContext } from "react";
import PulidoEstacionContext from "../../context/estacion/PulidoEstacionProvider";
const usePulidoEstacion = () => {
  return useContext(PulidoEstacionContext);
};
export default usePulidoEstacion;