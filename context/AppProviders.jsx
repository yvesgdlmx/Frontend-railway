import React from "react";
import { SurtidoProvider } from "./procesos/SurtidoProvider";
import { TalladoProvider } from "./procesos/TalladoProvider";
import { GeneradoProvider } from "./procesos/GeneradoProvider";
import { PulidoProvider } from "./procesos/PulidoProvider";
import { BiseladoProvider } from "./procesos/BiseladoProvider";
import { ProduccionProvider } from "./procesos/ProduccionProvider";
import { BiseladoLaProvider } from "./procesosLA/BiseladoLaProvider";
import { GeneradoLaProvider } from "./procesosLA/GeneradoLaProvider";
import { PulidoLaProvider } from "./procesosLA/PulidoLaProvider";

const AppProviders = ({ children }) => {
  return (
    <SurtidoProvider>
      <TalladoProvider>
        <GeneradoProvider>
          <PulidoProvider>
            <BiseladoProvider>
              <ProduccionProvider>
                <BiseladoLaProvider>
                  <GeneradoLaProvider>
                    <PulidoLaProvider>{children}</PulidoLaProvider>
                  </GeneradoLaProvider>
                </BiseladoLaProvider>
              </ProduccionProvider>
            </BiseladoProvider>
          </PulidoProvider>
        </GeneradoProvider>
      </TalladoProvider>
    </SurtidoProvider>
  );
};
export default AppProviders;
