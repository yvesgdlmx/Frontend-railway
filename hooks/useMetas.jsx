import { useContext } from "react";
import MetasContext from "../context/MetasProvider";

const useMetas = () => {
    return useContext(MetasContext);
}

export default useMetas;