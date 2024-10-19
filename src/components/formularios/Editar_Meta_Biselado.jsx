import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import clienteAxios from "../../../config/clienteAxios";
import Alerta from "../Alerta";

const Editar_Meta_Biselado = ({ meta }) => {
  const [nuevaMeta, setNuevaMeta] = useState('');
  const [name, setName] = useState('');
  const [alerta, setAlerta] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (meta) {
      setName(meta.name);
      setNuevaMeta(meta.meta);
    }
  }, [meta]);

  const editarMeta = async () => {
    try {
      const metaActualizada = { id: meta.id, name, meta: nuevaMeta };
      const { data } = await clienteAxios.put(`/metas/metas-biselados/editar/${meta.id}`, metaActualizada);
      mostrarAlerta({
        msg: 'Meta actualizada correctamente',
        error: false
      });
      setTimeout(() => {
        navigate('/biselado_metas');
      }, 1200);
    } catch (error) {
      console.error(error);
      mostrarAlerta({
        msg: 'Error al actualizar la meta',
        error: true
      });
    }
  };

  const mostrarAlerta = (alerta) => {
    setAlerta(alerta);
    setTimeout(() => {
      setAlerta({});
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ([name, nuevaMeta].includes('')) {
      mostrarAlerta({
        msg: 'Todos los campos son obligatorios',
        error: true
      });
      return;
    }
    await editarMeta();
  };

  const { msg } = alerta;

  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-6">
        Editando meta: <span className="text-indigo-600">{meta.name}</span>
      </h1>
      <div className="border border-slate-300 rounded-lg shadow-lg p-10 bg-white max-w-md mx-auto">
        {msg && <Alerta alerta={alerta} />}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Nombre</label>
            <input
              onChange={e => setName(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              type="text"
              value={name}
              placeholder="Ingresa el nombre"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Meta</label>
            <input
              onChange={e => setNuevaMeta(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              type="text"
              value={nuevaMeta}
              placeholder="Ingresa la meta"
            />
          </div>
          <div className="mt-6">
            <input
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
              value="Guardar Cambios"
            />
          </div>
        </form>
      </div>
    </>
  );
};

export default Editar_Meta_Biselado;
