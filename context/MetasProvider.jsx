import { useState, useEffect, createContext } from "react";
import clienteAxios from "../config/clienteAxios";
import { useNavigate } from "react-router-dom";

const MetasContext = createContext();

const MetasProvider = ({ children }) => {

    return (
        <MetasContext.Provider value={{

        }}
        >{children}
        </MetasContext.Provider>
    )
}

export {
    MetasProvider
}

export default MetasContext;