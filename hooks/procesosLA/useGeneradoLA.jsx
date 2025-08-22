import { useContext } from "react";
import GeneradoLaContext from "../../context/procesosLA/GeneradoLaProvider";
const useGeneradoLa = () => {
  return useContext(GeneradoLaContext);
};
export default useGeneradoLa;