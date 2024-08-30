import { useState, useEffect } from "react";
import clienteAxios from "../../config/clienteAxios";

const HistorialPorHora = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const [anio, setAnio] = useState(yesterday.getFullYear().toString());
  const [mes, setMes] = useState((yesterday.getMonth() + 1).toString().padStart(2, '0')); // Se suma 1 porque los meses van de 0 a 11
  const [dia, setDia] = useState(yesterday.getDate().toString());
  const [hora, setHora] =  useState('06:00:00-06:30:00');
  const [nombre, setNombre] = useState('')
  const [registros, setRegistros] = useState([]);

  const handleAnioChange = (e) => {
    setAnio(e.target.value);
  }
  
  const handleMesChange = (e) => {
    setMes(e.target.value);
  }
  
  const handleDiaChange = (e) => {
    setDia(e.target.value);
  }
  
  const handleHoraChange = (e) => {
    setHora(e.target.value);
  }

  const handleNombreChange = (e) => {
    setNombre(e.target.value);
  }

  console.log(nombre)
  console.log(anio)
  
  
  useEffect(() => {
    const obtenerRegistros = async () => {
      const { data } = await clienteAxios(`/historial/historial/${nombre}/${anio}/${mes}/${dia}/${hora}`)
      setRegistros(data.registrosFormateados)
    }
  
    obtenerRegistros();
  }, [nombre, anio, mes, dia, hora])

  const sumaHits = registros.reduce((total, registro) => total + registro.hits, 0);
  
  console.log(registros);


  return (
    <>
      <h1 className="heading">Historial de Registros</h1>
      <p className="heading__texto">Puedes filtrar tus registros por una fecha específica y un rango de horas.</p>
      <div className='selectores'>
      <div className='selectores__campo'>
            <label className='selectores__label' htmlFor="">Select a name</label>
            <select className='selectores__select' name="" id="" value={nombre} onChange={handleNombreChange}>
                <option className='selectores__option' value="BloqueoDeTallado">Bloqueo De Tallado</option>
                <option className='selectores__option' value="Generadores">Generadores</option>
                <option className='selectores__option' value="Pulido">Pulido</option>
                <option className='selectores__option' value="Engraver">Engraver</option>
                <option className='selectores__option' value="BloqueoDeTerminado">Bloqueo De Terminado</option>
                <option className='selectores__option' value="Biselado">Biselado</option>
            </select>
        </div>
        <div className='selectores__campo'>
            <label className='selectores__label' htmlFor="">Select a year</label>
            <select className='selectores__select' name="" id="" value={anio} onChange={handleAnioChange}>
                <option className='selectores__option' value="2024">2024</option>
                <option className='selectores__option' value="2023">2023</option>
            </select>
        </div>
        <div className='selectores__campo'>
            <label className='selectores__label' htmlFor="">Select a month</label>
            <select className='selectores__select' name="" id="" value={mes} onChange={handleMesChange}>
                <option className='selectores__option' value="01">Enero</option>
                <option className='selectores__option' value="02">Febrero</option>
                <option className='selectores__option' value="03">Marzo</option>
                <option className='selectores__option' value="04">Abril</option>
                <option className='selectores__option' value="05">Mayo</option>
                <option className='selectores__option' value="06">Junio</option>
                <option className='selectores__option' value="07">Julio</option>
                <option className='selectores__option' value="08">Agosto</option>
                <option className='selectores__option' value="09">Septiembre</option>
                <option className='selectores__option' value="10">Octubre</option>
                <option className='selectores__option' value="11">Noviembre</option>
                <option className='selectores__option' value="12">Diciembre</option>
            </select>
        </div>
        <div className='selectores__campo'>
            <label className='selectores__label' htmlFor="">Select a day</label>
            <select name="" id="" className='selectores__select' value={dia} onChange={handleDiaChange}>
                {[...Array(31).keys()].map((day) => (
                <option className='selectores__option' key={day + 1} value={day + 1}>{day + 1}</option>
                ))}
            </select>
        </div>
        <div className='selectores__campo'>
            <label className='selectores__label' htmlFor="">Select a time</label>
            <select className='selectores__select' name="" id="" value={hora} onChange={handleHoraChange}>
                <option className='selectores__option' value="06:00:00-06:30:00">6:00 am - 6:30 am</option>
                <option className='selectores__option' value="06:30:00-07:00:00">6:30 am - 7:00 am</option>
                <option className='selectores__option' value="07:00:00-07:30:00">7:00 am - 7:30 am</option>
                <option className='selectores__option' value="07:30:00-08:00:00">7:30 am - 8:00 am</option>
                <option className='selectores__option' value="08:30:00-09:00:00">8:30 am - 9:00 am</option>
                <option className='selectores__option' value="09:00:00-09:30:00">9:00 am - 9:30 am</option>
                <option className='selectores__option' value="09:30:00-10:00:00">9:30 am - 10:00 am</option>
                <option className='selectores__option' value="10:00:00-10:30:00">10:00 am - 10:30 am</option>
                <option className='selectores__option' value="10:30:00-11:00:00">10:30 am - 11:00 am</option>
                <option className='selectores__option' value="11:00:00-11:30:00">11:00 am - 11:30 am</option>
                <option className='selectores__option' value="11:30:00-12:00:00">11:30 am - 12:00 pm</option>
                <option className='selectores__option' value="12:00:00-12:30:00">12:00 pm - 12:30 pm</option>
                <option className='selectores__option' value="12:30:00-13:00:00">12:30 pm - 13:00 pm</option>
                <option className='selectores__option' value="13:00:00-13:30:00">13:00 pm - 13:30 pm</option>
                <option className='selectores__option' value="13:30:00-14:00:00">13:30 pm - 14:00 pm</option>
                <option className='selectores__option' value="14:00:00-14:30:00">14:00 pm - 14:30 pm</option>
                <option className='selectores__option' value="14:30:00-15:00:00">14:30 pm - 15:00 pm</option>
                <option className='selectores__option' value="15:00:00-15:30:00">15:00 pm - 15:30 pm</option>
                <option className='selectores__option' value="15:30:00-16:00:00">15:30 pm - 16:00 pm</option>
                <option className='selectores__option' value="16:00:00-16:30:00">16:00 pm - 16:30 pm</option>
                <option className='selectores__option' value="16:30:00-17:00:00">16:30 pm - 17:00 pm</option>
                <option className='selectores__option' value="17:00:00-17:30:00">17:00 pm - 17:30 pm</option>
                <option className='selectores__option' value="17:30:00-18:00:00">17:30 pm - 18:00 pm</option>
                <option className='selectores__option' value="18:00:00-18:30:00">18:00 pm - 18:30 pm</option>
                <option className='selectores__option' value="18:30:00-19:00:00">18:30 pm - 19:00 pm</option>
                <option className='selectores__option' value="19:00:00-19:30:00">19:00 pm - 19:30 pm</option>
                <option className='selectores__option' value="19:30:00-20:00:00">19:30 pm - 20:00 pm</option>
                <option className='selectores__option' value="20:00:00-20:30:00">20:00 pm - 20:30 pm</option>
                <option className='selectores__option' value="20:30:00-21:00:00">20:30 pm - 21:00 pm</option>
                <option className='selectores__option' value="21:00:00-21:30:00">21:00 pm - 21:30 pm</option>
                <option className='selectores__option' value="21:30:00-22:00:00">21:30 pm - 22:00 pm</option>
                <option className='selectores__option' value="22:00:00-22:30:00">22:00 pm - 22:30 pm</option>
                <option className='selectores__option' value="22:30:00-23:00:00">22:30 pm - 23:00 pm</option>
                <option className='selectores__option' value="23:00:00-23:30:00">23:00 pm - 23:30 pm</option>
                <option className='selectores__option' value="23:30:00-24:00:00">23:30 pm - 24:00 am</option>
                <option className='selectores__option' value="24:00:00-24:30:00">00:00 am - 00:30 am</option>
                <option className='selectores__option' value="24:30:00-01:00:00">00:30 am - 1:00 am</option>
                <option className='selectores__option' value="01:00:00-01:30:00">1:00 am - 1:30 am</option>
                <option className='selectores__option' value="01:30:00-02:00:00">1:30 am - 2:00 am</option>
            </select>
        </div>
    </div>
    <div className="tabla">
        <table className="b-tabla__table">
            <thead className="b-tabla__thead">
                <tr className="b-tabla__tr-head">
                    <th className="b-tabla__th-head">Nombre</th>
                    <th className="b-tabla__th-head">Fecha</th>
                    <th className="b-tabla__th-head">Hora</th>
                    <th className="b-tabla__th-head">Hits</th>
                </tr>
            </thead>
            <tbody className="b-tabla__tbody">
            {registros.length ? (
                registros.map(registro => (
                  <>
                    <tr className="b-tabla__tr-body" key={registro.id}>
                        <td className="b-tabla__td-body">{registro.name}</td>
                        <td className="b-tabla__td-body">{registro.fecha}</td>
                        <td className="b-tabla__td-body">{registro.hour}</td>
                        <td className="b-tabla__td-body">{registro.hits}</td>
                    </tr>
                    </>
                ))
            ) : (
                <p className="tabla__nohay">No hay registros de esa fecha</p>
            )}
            </tbody>
          </table>
      </div>
      <div className="tabla__total-contenedor">
        <p className="tabla__total-p">Total: <span className="tabla__total-suma">{sumaHits}</span></p>
      </div>
    </>
  )
}

export default HistorialPorHora;
