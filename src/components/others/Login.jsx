import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alerta from '../Alerta';
import clienteAxios from '../../../config/clienteAxios';
import useAuth from '../../../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alerta, sertAlerta] = useState({});
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    if ([email, password].includes('')) {
      sertAlerta({
        msg: 'Todos los campos son obligatorios',
        error: true
      });
      return;
    }
    try {
      const { data } = await clienteAxios.post('/login/login', { email, password });
      sertAlerta({});
      localStorage.setItem('token', data.token);
      setAuth(data);
      navigate('/');
    } catch (error) {
      sertAlerta({
        msg: error.response.data.msg,
        error: true
      });
    }
  };

  const { msg } = alerta;

  return (
    <div className="flex items-center justify-center">
      <div
        style={{
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
        className="bg-gray-800 rounded-lg shadow-xl overflow-hidden max-w-lg w-full"
      >
        <div className="p-8">
          <h2 className="text-center text-3xl font-extrabold text-white">Welcome Back</h2>
          <p className="mt-4 text-center text-gray-400">Sign in to continue</p>
          {msg && <Alerta alerta={alerta} />}
          <form method="POST" action="#" className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm">
              <div>
                <label className="sr-only" htmlFor="email">
                  Email address
                </label>
                <input
                  placeholder="Email address"
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  required=""
                  autoComplete="email"
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="mt-4">
                <label className="sr-only" htmlFor="password">
                  Password
                </label>
                <input
                  placeholder="Password"
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  required=""
                  autoComplete="current-password"
                  type="password"
                  name="password"
                  id="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <input
                  className="h-4 w-4 text-indigo-500 focus:ring-indigo-400 border-gray-600 rounded"
                  type="checkbox"
                  name="remember-me"
                  id="remember-me"
                />
                <label className="ml-2 block text-sm text-gray-400" htmlFor="remember-me">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a className="font-medium text-indigo-500 hover:text-indigo-400" href="#">
                  Forgot your password?
                </a>
              </div>
            </div>
            <div>
              <button
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-gray-900 bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                type="submit"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
        <div className="px-8 py-4 bg-gray-700 text-center">
          <span className="text-gray-400">Don't have an account?</span>
          <Link className="font-medium text-indigo-500 hover:text-indigo-400" to="#">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;