import { useContext } from "react";
import TerminadoEstacionContext from "../../context/estacion/TerminadoEstacionProvider";
const useTerminadoEstacion = () => {
  return useContext(TerminadoEstacionContext);
};
export default useTerminadoEstacion;