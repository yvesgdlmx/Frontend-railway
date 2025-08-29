import { useContext } from "react";
import ProduccionEstacionContext from "../../context/estacion/ProduccionEstacionProvider";
const useProduccionEstacion = () => {
  return useContext(ProduccionEstacionContext);
};
export default useProduccionEstacion;