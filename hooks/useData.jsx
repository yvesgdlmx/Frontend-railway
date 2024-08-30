import { useState, useEffect } from 'react';
import clienteAxios from "../config/clienteAxios";

const useData = (endpoint, metaEndpoint) => {
    const [data, setData] = useState({
        registros: [],
        meta: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            const [metaData, registrosData] = await Promise.all([
                clienteAxios(metaEndpoint),
                clienteAxios(endpoint)
            ]);

            const sumaMetas = metaData.data.registros.reduce((acc, registro) => acc + registro.meta, 0);
            setData({
                registros: registrosData.data.registros,
                meta: sumaMetas
            });
        };
        fetchData();
    }, [endpoint, metaEndpoint]);

    return data;
};

export default useData;