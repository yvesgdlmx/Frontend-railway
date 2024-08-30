import { Link } from "react-router-dom"

const Metas = () => {
  return (
    <>
    <h1 className="heading">Metas</h1>
    <p className="mt metas-p">Selecciona un proceso para administrar sus metas.</p>
    <div className="meta mt">
        <div className="meta__grid">
            <Link to={'/meta-tallado'}>
                <div class="card">
                    <div class="card-details">
                        <p class="text-title">B. tallado</p>
                    </div>
                    <button class="card-button">Ver metas</button>
                </div>
            </Link>
            <Link to={'/meta-generado'}>
                <div class="card">
                    <div class="card-details">
                        <p class="text-title">Generadores</p>
                    </div>
                    <button class="card-button">Ver metas</button>
                </div>
            </Link>
            <Link to={'/meta-pulido'}>
                <div class="card">
                    <div class="card-details">
                        <p class="text-title">Pulido</p>
                    </div>
                    <button class="card-button">Ver metas</button>
                </div>
            </Link>
            <Link to={'/meta-engraver'}>
                <div class="card">
                    <div class="card-details">
                        <p class="text-title">Engraver</p>
                    </div>
                    <button class="card-button">Ver metas</button>
                </div>
            </Link>
            <Link to={'/meta-terminado'}>
                <div class="card">
                    <div class="card-details">
                        <p class="text-title">B. Terminado</p>
                    </div>
                    <button class="card-button">Ver metas</button>
                </div>
            </Link>
            <Link to={'/meta-biselado'}>
                <div class="card">
                    <div class="card-details">
                        <p class="text-title">Biselado</p>
                    </div>
                    <button class="card-button">Ver metas</button>
                </div>
            </Link>
            <Link to={'/meta-manual'}>
                <div class="card">
                    <div class="card-details">
                        <p class="text-title">Manuales</p>
                    </div>
                    <button class="card-button">Ver metas</button>
                </div>
            </Link>
        </div>
    </div>
    </>
  )
}

export default Metas
