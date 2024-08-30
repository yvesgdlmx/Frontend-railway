import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import clienteAxios from '../../config/clienteAxios'

const Manuales = () => {

const [metas, setMetas] = useState([]);
const [totalMetas, setTotalMetas] = useState(0);

useEffect(() => {
    const obtenerMetas = async () => {
        try {
            const response = await clienteAxios.get('/metas/metas-manuales');
            const metasObtenidas = response.data.registros;
            setMetas(metasObtenidas);
            const totalMetas = metasObtenidas.reduce((acc, meta) => acc + meta.meta, 0);
            setTotalMetas(totalMetas); // Asumiendo que tienes un estado para el total
        } catch (error) {
            console.error('Error fetching metas:', error);
        }
    };
    obtenerMetas();
}, []);

console.log(metas)
console.log(totalMetas)

  return (
    <>
    <h1 className="heading">Meta De Estaciones Manuales</h1>
    <div className='metas-modulo'>
        <div className='metas-modulo__contenedor'>
            <table className='tabla'>
                <thead className='tabla__thead'>
                    <tr className='tabla__th'>
                        <th className='tabla__th'>Nombre</th>
                        <th className='tabla__th'>Meta</th>
                        <th className='tabla__th'>Acciones</th>
                    </tr>
                </thead>
                <tbody className='tabla__tbody'>
                    {metas.map(meta => (
                         <tr className='tabla__tr' key={meta.id}>
                            <td className='tabla__td text-transform'>{meta.name}</td>
                            <td className='tabla__td'>{meta.meta}</td>
                            <td className='tabla__td'>
                                <Link to={`/editar-biselado/${meta.id}`}>
                                    <input type="text" value='editar' className='tabla__boton'/>
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className='tabla__total'>
                <p className='tabla__total-p'>Suma total: <span className='tabla__total-span'>{totalMetas}</span></p>
            </div>
        </div>
    </div>
    </>
  )
}

export default Manuales
