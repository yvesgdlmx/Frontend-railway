import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import clienteAxios from "../config/clienteAxios";

const GeneradoMaquina = () => {
    const { anio, mes, dia, hora } = useParams();

    const [registros, setRegistros] = useState([]);


    useEffect(() => {
        const obtenerRegistros = async () => {
            console.log(anio, mes, dia, hora);
            try {
                const { data } = await clienteAxios(`/generadores/generadores/porhora/${anio}/${mes}/${dia}/${hora}`);
                setRegistros(data);
                console.log(data);
            } catch (error) {
                console.log(error);
            }
        };

        obtenerRegistros();
    }, [anio, mes, dia, hora]);

    console.log(registros);

    return (
        <>  
        <h1 className="heading">Generadores por hora</h1>
       <div className="generado-maquina">
            <Link className="boton__link" to={'/generado-horas'}>
                <button className="boton__regresar">
                    <img src="/back.png" alt="" className="boton__regresar-img" width={200}/>
                    back
                </button>
            </Link>
            <table className="tabla">
                <thead className="tabla__thead">
                    <tr className="tabla__tr">
                        <th className="tabla__th">Hora</th>
                        <th className="tabla__th">Generador</th>
                        <th className="tabla__th">Hits</th>
                        <th className="tabla__th">Fecha</th>
                    </tr>
                </thead>
                <tbody className="tabla__tbody">
                    {registros.map(registro => {
                        // Extraer la parte del nombre antes del primer guion
                        const nombre = registro.name.split('-')[0].trim();

                        return (
                            <tr className="tabla__tr-generador" key={registro.id}>
                                <td className="tabla__td-generador">
                                    <div className="tabla__td-campo">
                                        <p className="tabla__td-p">{registro.hour}</p>
                                    </div>
                                </td>
                                <td className="tabla__td-generador">
                                   <div className="tabla__td-campo">
                                        <p className="tabla__td-p">{nombre}</p>
                                    </div> 
                                </td>
                                <td className="tabla__td-generador">
                                    <div className="tabla__td-campo">
                                        <p className="tabla__td-p">{registro.hits}</p>
                                    </div>
                                </td>
                                <td className="tabla__td-generador">
                                    <div className="tabla__td-campo">
                                        <p className="tabla__td-p">{registro.fecha}</p>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
        </>
    );
};

export default GeneradoMaquina;