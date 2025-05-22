const Alerta = ({ alerta }) => {
  return (
    <div
      className={`${
        alerta.error ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'
      } border-l-4 p-4 mb-4 rounded`}
      role="alert"
    >
      <p className="font-bold">{alerta.error ? 'Error' : 'Éxito'}</p>
      <p>{alerta.msg}</p>
    </div>
  );
};

export default Alerta;