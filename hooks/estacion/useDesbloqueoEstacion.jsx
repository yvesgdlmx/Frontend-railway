import { useContext } from "react";
import DesbloqueoEstacionContext from "../../context/estacion/DesbloqueoEstacionProvider";
const useDesbloqueoEstacion = () => {
  return useContext(DesbloqueoEstacionContext);
};
export default useDesbloqueoEstacion;