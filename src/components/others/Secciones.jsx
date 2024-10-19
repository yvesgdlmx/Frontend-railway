import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Secciones = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      const mobileElement = document.getElementById(`${id}-mobile`);

      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else if (mobileElement) {
        mobileElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);
};

export default Secciones;