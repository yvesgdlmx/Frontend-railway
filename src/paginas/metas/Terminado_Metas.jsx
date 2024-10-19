import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import clienteAxios from '../../../config/clienteAxios';

const Terminado_Metas = () => {
  const [metas, setMetas] = useState([]);
  const [totalMetas, setTotalMetas] = useState(0);

  useEffect(() => {
    const obtenerMetas = async () => {
      try {
        const response = await clienteAxios.get('/metas/metas-terminados');
        const metasObtenidas = response.data.registros;
        setMetas(metasObtenidas);
        const totalMetas = metasObtenidas.reduce((acc, meta) => acc + meta.meta, 0);
        setTotalMetas(totalMetas);
      } catch (error) {
        console.error('Error fetching metas:', error);
      }
    };
    obtenerMetas();
  }, []);

  return (
    <>
      <div className="overflow-x-auto">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-3 border border-gray-300 bg-blue-500 text-center text-sm font-semibold text-white uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-4 py-3 border border-gray-300 bg-blue-500 text-center text-sm font-semibold text-white uppercase tracking-wider">
                  Meta
                </th>
                <th className="px-4 py-3 border border-gray-300 bg-blue-500 text-center text-sm font-semibold text-white uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {metas.map((meta) => (
                <tr key={meta.id} className="hover:bg-gray-100">
                  <td className="px-4 py-3 border border-gray-300 text-gray-600 text-center text-sm font-semibold">
                    {meta.name}
                  </td>
                  <td className="px-4 py-3 border border-gray-300 text-gray-600 text-center text-sm font-semibold">
                    {meta.meta}
                  </td>
                  <td className="px-4 py-3 border border-gray-300 text-center">
                    <Link to={`/editar_terminado/${meta.id}`}>
                      <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full transition duration-300">
                        Editar
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-4 bg-white border-t flex justify-end">
            <p className="text-gray-900 font-semibold">
              Suma total: <span className="font-bold">{totalMetas}</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Terminado_Metas;