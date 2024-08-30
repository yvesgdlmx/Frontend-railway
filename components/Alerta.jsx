const Alerta = ({alerta}) => {
    return (
      <div className={`${alerta.error ? 'alerta__error' : 'alerta__exito'} alerta `}>
          {alerta.msg}
      </div>
    )
  }
  
  export default Alerta