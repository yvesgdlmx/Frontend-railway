import { useContext } from 'react';
import BiseladoContext from '../../context/procesos/BiseladoProvider';
const useBiselado = () => {
  return useContext(BiseladoContext);
};
export default useBiselado;