import { useContext } from 'react';
import ProduccionContext from '../../context/procesos/ProduccionProvider';
const useProduccion = () => {
  return useContext(ProduccionContext);
};
export default useProduccion;