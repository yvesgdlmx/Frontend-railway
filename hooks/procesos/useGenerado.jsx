import { useContext } from 'react';
import GeneradoContext from '../../context/procesos/GeneradoProvider';
const useGenerado = () => {
  return useContext(GeneradoContext);
};
export default useGenerado;