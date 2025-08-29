import { useContext } from "react";
import GeneradoEstacionLAContext from "../../context/estacionLA/GeneradoEstacionLAContext";

const useGeneradoLAEstacion = () => {
  return useContext(GeneradoEstacionLAContext);
};
export default useGeneradoLAEstacion;