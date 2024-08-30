import { Link } from "react-router-dom";

const Tableros = () => {
  return (
    <>
      <h1 className="heading">Tableros de Producción</h1>
      <p className="heading__texto">Elige un área para mostrar</p>
      <div className="tableros">
        <div className="tableros__grid">
          <Link to="/tableros-tallado" className="tableros__link">
            <div class="card">
              <div class="card-details">
                <p class="text-title">B. tallado</p>
                <p class="text-body">B. Tallado, Generadores, Pulido y Engraver. </p>
              </div>
              <button class="card-button">Ver tablero</button>
            </div>
          </Link>
          <Link to="/tableros-terminado" className="tableros__link">
            <div class="card">
              <div class="card-details">
                <p class="text-title">B. Terminado</p>
                <p class="text-body">B. Terminado y Biselado. </p>
              </div>
              <button class="card-button">Ver tablero</button>
            </div>
          </Link>
          <Link to="/tableros-tallado&terminado" className="tableros__link">
            <div class="card">
              <div class="card-details">
                <p class="text-title">B.tallado y B.Terminado</p>
                <p class="text-body">B. Tallado, Generadores, Pulido, Engraver, B.terminado y Biselado. </p>
              </div>
              <button class="card-button">Ver tablero</button>
            </div>
          </Link>
      </div>
      </div>
    </>
  );
};

export default Tableros;