import { useContext } from "react";
import PulidoLaContext from "../../context/procesosLA/PulidoLaProvider";
const usePulidoLA = () => {
  return useContext(PulidoLaContext);
};
export default usePulidoLA;