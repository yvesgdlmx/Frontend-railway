import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import clienteAxios from '../../../../config/clienteAxios';
import Alerta from '../../../components/Alerta';
import Editar_Meta_Biselado from '../../../components/formularios/Editar_Meta_Biselado';

const Editar_Biselado = () => {
  const [meta, setMeta] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerMeta = async () => {
      try {
        const { data } = await clienteAxios(`/metas/metas-biselados/${id}`);
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
        <Editar_Meta_Biselado meta={meta} />
      </div>
    </>
  );
};

export default Editar_Biselado;