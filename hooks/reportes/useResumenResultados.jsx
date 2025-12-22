import { useContext } from "react";
import ResumenResultadosContext from "../../context/reportes/ResumenResultadosProvider";

const useResumenResultados = () => {
  return useContext(ResumenResultadosContext);
};

export default useResumenResultados;