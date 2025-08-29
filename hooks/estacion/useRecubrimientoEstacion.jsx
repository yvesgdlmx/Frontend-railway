import { useContext } from "react";
import RecubrimientoEstacionContext from "../../context/estacion/RecubrimientoEstacionProvider";
const useRecubrimientoEstacion = () => {
  return useContext(RecubrimientoEstacionContext);
};
export default useRecubrimientoEstacion;