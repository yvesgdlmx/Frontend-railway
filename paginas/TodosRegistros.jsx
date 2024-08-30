import { useState, useEffect } from "react";
import clienteAxios from "../config/clienteAxios";

const TodosRegistros = () => {
  const [registros, setRegistros] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina] = useState(10); // Cambia esto al número de registros que quieres mostrar por página

  useEffect(() => {
    const obtenerRegistros = async () => {
      const { data } = await clienteAxios(`/generadores/generadores/todos`);
      setRegistros(data.registros);
    };
    obtenerRegistros();
  }, []);

  const indiceUltimoRegistro = paginaActual * registrosPorPagina;
  const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;
  const registrosActuales = registros.slice(indicePrimerRegistro, indiceUltimoRegistro);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  return (
    <>
      <div className="heading">
          <h1 className="heading__h1">All records</h1>
      </div>
      <div className="tabla">
          <table className="tabla__table">
            <thead className="tabla__thead">
              <tr className="tabla__tr">
                <th className="tabla__th">Name</th>
                <th className="tabla__th">Date</th>
                <th className="tabla__th">Time</th>
                <th className="tabla__th">Number</th>
                <th className="tabla__th">Hits</th>
              </tr>
            </thead>
            <tbody>
              {registrosActuales.length ? (
                registrosActuales.map((registro) => (
                  <tr className="tabla__tr" key={registro.id}>
                    <td className="tabla__td">{registro.name}</td>
                    <td className="tabla__td">{registro.fecha}</td>
                    <td className="tabla__td">{registro.hour}</td>
                    <td className="tabla__td">{registro.num}</td>
                    <td className="tabla__td">{registro.hits}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No hay registros para mostrar</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="paginacion">
            <div className="paginacion__contenido">
              <button className="paginacion__boton" onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1}>Previous</button>
              <span className="paginacion__span">Página {paginaActual}</span>
              <button className="paginacion__boton" onClick={() => cambiarPagina(paginaActual + 1)} disabled={registrosActuales.length < registrosPorPagina}>Next</button>
            </div>
          </div>
      </div>
    </>
  );
};

export default TodosRegistros;