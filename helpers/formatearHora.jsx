const formatearHora = (horaCompleta) => {
    // Separar la hora, minutos y segundos
    const [hora, minutos] = horaCompleta.split(':');

    // Formatear la hora en un formato de 24 horas
    const horaFormateada = `${hora.padStart(2, '0')}:${minutos.padStart(2, '0')}`;

    return horaFormateada;
};

export default formatearHora