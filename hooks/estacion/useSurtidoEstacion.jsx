import { useContext } from "react";
import SurtidoEstacionContext from "../../context/estacion/SurtidoEstacionProvider";
const useSurtidoEstacion = () => {
  return useContext(SurtidoEstacionContext);
};
export default useSurtidoEstacion;