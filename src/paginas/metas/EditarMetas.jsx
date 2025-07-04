import React from "react";
import MetasManuales from "../../components/metas/MetasManuales";
import MetasTallado from "../../components/metas/MetasTallado";
import MetasGeneradores from "../../components/metas/MetasGeneradores";
import MetasPulidos from "../../components/metas/MetasPulidos";
import Heading from "../../components/others/Heading";
import MetasEngravers from "../../components/metas/MetasEngravers";
import MetasTerminados from "../../components/metas/MetasTerminados";
import MetasBiselados from "../../components/metas/MetasBiselados";

const EditarMetas = () => {
  return (
    <>
      <div className="mt-6 md:mt-0">
        <Heading title="Editar metas" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetasManuales />
        <MetasTallado />
        <MetasGeneradores/>
        <MetasPulidos/>
        <MetasEngravers/>
        <MetasTerminados/>
        <MetasBiselados/>
      </div>
    </>
  );
};
export default EditarMetas;