import { useState, useEffect, useRef } from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {

    return (
        <>
       <main className="min-h-screen min-w-full bg-gradient-to-r from-blue-500 to-blue-300 flex flex-col md:p-10 xs:p-2">
            <Link to={'/'}>
                <div className="flex justify-start w-full items-center mb-10">
                    <img src="/img/home.png" alt="" style={{ filter: 'invert(100%)' }} width={25} />
                    <p className='text-xl uppercase text-white font-bold'>Home</p>
                </div>
            </Link>
            <div className="bg-slate-200 p-6 rounded-lg shadow-lg w-full max-w-lg mx-auto">
                <Outlet />
            </div>
            <p className="font-semibold text-center mt-6 text-gray-700">
                Todos los derechos reservados Optimex SA de CV ©
            </p>
        </main>
        </>
    );
};

export default AuthLayout;