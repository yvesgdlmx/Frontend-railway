import { useContext } from 'react';
import PulidoContext from '../../context/procesos/PulidoProvider';
const usePulido = () => {
  return useContext(PulidoContext);
};
export default usePulido;