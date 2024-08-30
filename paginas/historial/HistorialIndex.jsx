import { Link } from "react-router-dom";

const HistorialIndex = () => {

  return (
    <>
      <h1 className="heading">Historial de registros</h1>
      <p className="heading__texto">Elige un método para filtrar los registros</p>
      <div className="tableros">
        <div className="tableros__grid-2">
          <Link to="/historial-turnos" className="tableros__link">
            <div class="card">
              <div class="card-details">
                <p class="text-title">Registro por dia</p>
                <p class="text-body">Selecciona una dia y visualiza tu historial. </p>
              </div>
              <button class="card-button">Ver Historial</button>
            </div>
          </Link>
          <Link to="/historial-rangos" className="tableros__link">
            <div class="card">
              <div class="card-details">
                <p class="text-title">Registros por rangos</p>
                <p class="text-body">Selecciona un rango de dias y visualiza tu historial. </p>
              </div>
              <button class="card-button">Ver Historial</button>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}

export default HistorialIndex
