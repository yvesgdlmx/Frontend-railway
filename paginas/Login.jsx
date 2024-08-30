import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Alerta from '../components/Alerta'
import clienteAxios from '../config/clienteAxios'
import useAuth from '../hooks/useAuth'


const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [alerta, sertAlerta] = useState({})

    const { setAuth } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();

        if([email, password].includes('')) {
            sertAlerta({
                msg: 'Todos los campos son obligatorios',
                error: true
            })
            return;
        }

        try {
            const { data } = await clienteAxios.post('/login/login', {email, password})
            sertAlerta({})
            localStorage.setItem('token', data.token)
            setAuth(data)
            navigate('/')
        } catch (error) {
            sertAlerta( {
                msg: error.response.data.msg,
                error: true
            })
        }
    }

    const { msg } = alerta;

  return (
    <div className='login'>
        <h1 className='login__titulo'>Iniciar sesión</h1>
        {msg && <Alerta alerta={alerta} />}
        <div className='login__contenedor'>
        <form action="" className='login__formulario'
            onSubmit={handleSubmit}
        >
            <div className='login__campo'>
                <label htmlFor="" className='login__label'>Email: </label>
                <input id="email" type="text" className='login__input' placeholder='Tu Email' value={email}
                    onChange={ e => setEmail(e.target.value)}/>
            </div>
            <div className='login__campo'>
                <label htmlFor="" className='login__label'>Password: </label>
                <input id="password" type="password" className='login__input' placeholder='Password' value={password}
                    onChange={ e => setPassword(e.target.value)}/>
            </div>
            <input type="submit" value="Iniciar Sesión" className='login__boton'/>
        </form>
        </div>
        <nav>
            <Link className='navegacion'>
                <p className='navegacion__p'>¿No Tienes una cuenta? Crear una</p>
                <p className='navegacion__p'>¿Olvidaste tu Password? Recuperar password</p>
            </Link>
        </nav>
    </div>
  )
}

export default Login
