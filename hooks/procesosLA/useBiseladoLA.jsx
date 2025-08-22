import { useContext } from 'react';
import BiseladoLaContext from '../../context/procesosLA/BiseladoLaProvider';
const useBiseladoLA = () => {
  return useContext(BiseladoLaContext);
};
export default useBiseladoLA;