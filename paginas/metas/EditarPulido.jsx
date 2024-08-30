import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Link } from "react-router-dom";
import clienteAxios from "../../config/clienteAxios";
import FormularioEditarPulido from "../../components/FormularioEditarPulido";

const EditarPulido = () => {
    const [meta, setMeta] =  useState({});
    const {id} = useParams();

    useEffect(() => {
        const obtenerMeta = async () => {
            const { data } = await clienteAxios(`/metas/metas-pulidos/${id}`);
            setMeta(data);
        };
        obtenerMeta();
    }, []);

    console.log(meta)
    console.log(id)

  return (
    <>
    <div className="boton__link">
        <Link className="links" to={'/meta-pulido'}>
            <button className="boton__regresar">
                <img src="/back.png" alt="" className="boton__regresar-img" />
                Volver
            </button>
        </Link>
    </div>
    <div>
      <FormularioEditarPulido
        meta={meta}
      />
    </div>
    </>
  )
}

export default EditarPulido;
