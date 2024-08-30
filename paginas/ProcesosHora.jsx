import { useEffect, useState } from "react";
import GeneradoHora from "../components/GeneradoHora";
import TalladoHora from "../components/TalladoHora";
import PulidoHora from "../components/PulidoHora";
import EngraverHora from "../components/EngraverHora";
import TerminadoHora from "../components/TerminadoHora";
import BiseladoHora from "../components/BiseladoHora";
import ManualesHora from "../components/ManualesHora";
import LensLogHora from "../components/LensLogHora";
import JobCompleteHora from "../components/JobCompleteHora";
import DesblockingHora from "../components/DesblockingHora";
import ARHora from "../components/ARHora";

const ProcesosHora = () => {
    useEffect(() => {
        const interval = setInterval(() => {
          window.location.reload();
        }, 300000); // Actualiza cada 5 minutos
    
        return () => clearInterval(interval);
      }, []);
      
    return (
        <>
            <h1 className="heading2 ml-3">Trabajos por hora</h1>
            <LensLogHora/>
            <TalladoHora/>
            <GeneradoHora/>
            <PulidoHora/>
            <EngraverHora/>
            <DesblockingHora/>
            <ARHora/>
            <TerminadoHora/>
            <BiseladoHora/>
            <JobCompleteHora/>
        </>
    );
};

export default ProcesosHora;