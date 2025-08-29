import { useContext } from "react";
import GeneradoEstacionContext from "../../context/estacion/GeneradoEstacionProvider";
const useGeneradoEstacion = () => {
  return useContext(GeneradoEstacionContext);
};
export default useGeneradoEstacion;