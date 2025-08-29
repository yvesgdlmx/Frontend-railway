import { SurtidoProvider } from "./procesos/SurtidoProvider";
import { TalladoProvider } from "./procesos/TalladoProvider";
import { GeneradoProvider } from "./procesos/GeneradoProvider";
import { PulidoProvider } from "./procesos/PulidoProvider";
import { BiseladoProvider } from "./procesos/BiseladoProvider";
import { ProduccionProvider } from "./procesos/ProduccionProvider";
import { BiseladoLaProvider } from "./procesosLA/BiseladoLaProvider";
import { GeneradoLaProvider } from "./procesosLA/GeneradoLaProvider";
import { PulidoLaProvider } from "./procesosLA/PulidoLaProvider";
/* Segunda seccion - Estaciones */
import { SurtidoEstacionProvider } from "./estacion/SurtidoEstacionProvider";
import { TalladoEstacionProvider } from "./estacion/TalladoEstacionProvider";
import { GeneradoEstacionProvider } from "./estacion/GeneradoEstacionProvider";
import { PulidoEstacionProvider } from "./estacion/PulidoEstacionProvider";
import { EngraverEstacionProvider } from "./estacion/EngraverEstacionProvider";
import { DesbloqueoEstacionProvider } from "./estacion/DesbloqueoEstacionProvider";
import { TerminadoEstacionProvider } from "./estacion/TerminadoEstacionProvider";
import { BiseladoEstacionProvider } from "./estacion/BiseladoEstacionProvider";
import { ProduccionEstacionProvider } from "./estacion/ProduccionEstacionProvider";
import { AREstacionProvider } from "./estacion/AREstacionProvider";
import { HardcoatEstacionProvider } from "./estacion/HardcoatEstacionProvider";
import { RecubrimientoEstacionProvider } from "./estacion/RecubrimientoEstacionProvider";
import { BiseladoEstacionLAProvider } from "./estacionLA/BiseladoEstacionLAContext";
import { GeneradoEstacionLAProvider } from "./estacionLA/GeneradoEstacionLAContext";
import { PulidoEstacionLAProvider } from "./estacionLA/PulidoEstacionLAContext";

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
                    <PulidoLaProvider>
                      <SurtidoEstacionProvider>
                        <TalladoEstacionProvider>
                          <GeneradoEstacionProvider>
                            <PulidoEstacionProvider>
                              <EngraverEstacionProvider>
                                <DesbloqueoEstacionProvider>
                                  <TerminadoEstacionProvider>
                                    <BiseladoEstacionProvider>
                                      <ProduccionEstacionProvider>
                                        <AREstacionProvider>
                                          <HardcoatEstacionProvider>
                                            <RecubrimientoEstacionProvider>
                                              <BiseladoEstacionLAProvider>
                                                <GeneradoEstacionLAProvider>
                                                  <PulidoEstacionLAProvider>
                                                    {children}
                                                  </PulidoEstacionLAProvider>
                                                </GeneradoEstacionLAProvider>
                                              </BiseladoEstacionLAProvider>
                                            </RecubrimientoEstacionProvider>
                                          </HardcoatEstacionProvider>
                                        </AREstacionProvider>
                                      </ProduccionEstacionProvider>
                                    </BiseladoEstacionProvider>
                                  </TerminadoEstacionProvider>
                                </DesbloqueoEstacionProvider>
                              </EngraverEstacionProvider>
                            </PulidoEstacionProvider>
                          </GeneradoEstacionProvider>
                        </TalladoEstacionProvider>
                      </SurtidoEstacionProvider>
                    </PulidoLaProvider>
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
