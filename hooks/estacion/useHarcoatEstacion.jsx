import { useContext } from "react";
import HardcoatEstacionContext from "../../context/estacion/HardcoatEstacionProvider";
const useHardcoatEstacion = () => {
  return useContext(HardcoatEstacionContext);
};
export default useHardcoatEstacion;