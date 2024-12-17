import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import clienteAxios from '../../../../config/clienteAxios';
import Alerta from '../../../components/Alerta';
import Editar_Meta_Manuales from '../../../components/formularios/Editar_Meta_Manuales';


const Editar_Manuales = () => {
  const [meta, setMeta] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerMeta = async () => {
      try {
        const { data } = await clienteAxios(`/metas/metas-manuales/${id}`);
        setMeta(data);
      } catch (error) {
        console.error(error);
        // Puedes mostrar una alerta aquí si ocurre un error al obtener la meta
      }
    };
    obtenerMeta();
  }, [id]);

  return (
    <>
      <div>
        <Editar_Meta_Manuales meta={meta} />
      </div>
    </>
  );
};

export default Editar_Manuales;