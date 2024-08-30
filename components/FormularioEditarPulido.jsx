import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import clienteAxios from "../config/clienteAxios";
import Alerta from "./Alerta";

const FormularioEditarPulido = ({ meta }) => {
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

    console.log(meta.id)

    const editarMeta = async () => {
        try {
            const metaActualizada = { id: meta.id, name, meta: nuevaMeta };
            const { data } = await clienteAxios.put(`/metas/metas-pulidos/editar/${meta.id}`, metaActualizada);
            mostrarAlerta({
                msg: 'Meta actualizada correctamente',
                error: false
            });
            setTimeout(() => {
                navigate('/meta-pulido');
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
            <h1 className="heading">Editando meta: <span className="formulario__nombre-meta">{meta.name}</span></h1>
            <div>
                {msg && <Alerta alerta={alerta} />}
                <form onSubmit={handleSubmit} className="formulario">
                    <div className="formulario__campo">
                        <label className="formulario__label">Nombre</label>
                        <input onChange={e => setName(e.target.value)} className="formulario__input" type="text" value={name} />
                    </div>
                    <div className="formulario__campo">
                        <label className="formulario__label">Meta</label>
                        <input onChange={e => setNuevaMeta(e.target.value)} className="formulario__input" type="text" value={nuevaMeta} />
                    </div>
                    <div className="formulario__acciones">
                        <input type="submit" className="formulario__boton" value='Guardar Cambios' />
                    </div>
                </form>
            </div>
        </>
    );
};

export default FormularioEditarPulido;