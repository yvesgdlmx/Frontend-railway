import { useContext } from 'react';
import TalladoContext from '../../context/procesos/TalladoProvider';
const useTallado = () => {
  return useContext(TalladoContext);
};
export default useTallado;