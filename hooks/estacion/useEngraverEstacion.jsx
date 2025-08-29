import { useContext } from "react";
import EngraverEstacionContext from "../../context/estacion/EngraverEstacionProvider";
const useEngraverEstacion = () => {
  return useContext(EngraverEstacionContext);
};
export default useEngraverEstacion;