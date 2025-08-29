import { useContext } from "react";
import TalladoEstacionContext from "../../context/estacion/TalladoEstacionProvider";
const useTalladoEstacion = () => {
  return useContext(TalladoEstacionContext);
};
export default useTalladoEstacion;