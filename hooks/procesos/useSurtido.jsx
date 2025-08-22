import { useContext } from 'react';
import SurtidoContext from '../../context/procesos/SurtidoProvider';
const useSurtido = () => {
  return useContext(SurtidoContext);
};
export default useSurtido;