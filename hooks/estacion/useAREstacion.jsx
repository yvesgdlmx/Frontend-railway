import { useContext } from "react";
import AREstacionContext from "../../context/estacion/AREstacionProvider";
const useAREstacion = () => {
  return useContext(AREstacionContext);
};
export default useAREstacion;