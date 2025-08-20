import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import clienteAxios from '../../../config/clienteAxios';
import Heading from '../../components/others/Heading';
import Paginador from '../../components/others/Paginador';
import TablaGenerica from '../../components/others/TablaGenerica';
import Actualizacion from '../../components/others/Actualizacion';
import CardMobile from '../../components/others/CardMobile';
import FiltrosCustom from '../../components/others/html_personalizado/FiltrosCustom';

const ReporteTrabajosSinMovimientos = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  // Opciones para el filtro
  const filterOptions = [
    { value: 'enterDate', label: 'Enter Date' },
    { value: 'trayNumber', label: 'Tray Number' },
    { value: 'currentStation', label: 'Current Station' },
    { value: 'currentStnDate', label: 'Current Stn Date' },
    { value: 'division', label: 'Division' },
    { value: 'fs', label: 'F/S' },
  ];
  // Campo seleccionado para filtrar (por defecto tomamos el primero)
  const [selectedFilterField, setSelectedFilterField] = useState(filterOptions[0]);
  // Valor ingresado para filtrar (input)
  const [filterValue, setFilterValue] = useState('');
  const [ultimaActualizacion, setUltimaActualizacion] = useState('');
  const itemsPerPage = 100;
  // Actualización de la hora y refresco automático
  useEffect(() => {
    const actualizarHora = () => {
      const ahora = new Date();
      ahora.setMinutes(35, 0, 0);
      const horaFormateada = ahora.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      setUltimaActualizacion(horaFormateada);
    };
    const verificarYActualizar = () => {
      const ahora = new Date();
      if (ahora.getMinutes() === 35) {
        actualizarHora();
        window.location.reload();
      }
    };
    actualizarHora();
    const intervalo = setInterval(verificarYActualizar, 60000);
    return () => clearInterval(intervalo);
  }, []);
  // Obtención de datos desde el endpoint
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await clienteAxios.get('/reportes/reportes/movimientos');
        const registros = response.data.registros.map((registro) => ({
          id: registro.id,
          enterDate: registro.enter_date,
          trayNumber: registro.tray_number,
          currentStation: registro.current_station,
          division: registro.division,
          daysInProcess: registro.days_in_process,
          currentStnDate: registro.current_stn_date,
          currentStnTime: registro.current_stn_time,
          fs: registro.f_s,
          diaActual: registro.dia_actual,
          horaActual: registro.hora_actual,
          transcurrido: registro.transcurrido,
          diaYHora: `${moment(registro.dia_actual).format('DD/MM/YYYY')} ${registro.hora_actual}`,
        }));
        setData(registros);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };
    fetchData();
  }, []);
  // Reiniciamos la página actual al cambiar el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilterField, filterValue]);
  // Filtrado según el campo y el valor ingresado
  const filteredData = data.filter((registro) => {
    if (filterValue === '') return true;
    return registro[selectedFilterField.value]
      .toString()
      .toLowerCase()
      .includes(filterValue.toLowerCase());
  });
  // Paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  // Columnas de la tabla
  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Enter Date', accessor: 'enterDate' },
    { header: 'Tray Number', accessor: 'trayNumber' },
    { header: 'Current Station', accessor: 'currentStation' },
    { header: 'Division', accessor: 'division' },
    { header: 'Current Stn Date', accessor: 'currentStnDate' },
    { header: 'Current Stn Time', accessor: 'currentStnTime' },
    { header: 'F/S', accessor: 'fs' },
    { header: 'Dia Actual', accessor: 'diaActual' },
    { header: 'Hora Actual', accessor: 'horaActual' },
    { header: 'Transcurrido', accessor: 'transcurrido' },
  ];
  return (
    <>
      <div className="mt-6 md:mt-0">
        <Heading title="Reporte de Trabajos Sin Movimientos" />
      </div>
      <div className="mt-6 lg:mt-0 bg-gray-100 min-h-screen p-4">
        <Actualizacion ultimaActualizacion={ultimaActualizacion} />
        {/* Uso del componente de filtros personalizado */}
        <FiltrosCustom
          filterOptions={filterOptions}
          selectedFilterField={selectedFilterField}
          onChangeFilterField={(option) => setSelectedFilterField(option)}
          filterValue={filterValue}
          onChangeFilterValue={(e) => setFilterValue(e.target.value)}
        />
        {/* Vista de tabla para pantallas grandes */}
        <div className="overflow-x-auto hidden lg:block text-sm">
          <TablaGenerica columns={columns} data={currentData} />
          <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-b-lg mt-4">
            <div className="text-sm text-gray-600">
              Mostrando {filteredData.length === 0 ? 0 : indexOfFirstItem + 1} -{' '}
              {indexOfLastItem > filteredData.length ? filteredData.length : indexOfLastItem} de {filteredData.length} registros
            </div>
            <Paginador currentPage={currentPage} totalPages={totalPages} goToPage={goToPage} />
          </div>
        </div>
        {/* Vista para móviles */}
        <div className="lg:hidden space-y-4">
          {currentData.map((registro, index) => (
            <CardMobile key={index} registro={registro} />
          ))}
          <div className="flex flex-col space-y-2 bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-center text-sm text-gray-600">
              Mostrando {filteredData.length === 0 ? 0 : indexOfFirstItem + 1} -{' '}
              {indexOfLastItem > filteredData.length ? filteredData.length : indexOfLastItem} de {filteredData.length} registros
            </div>
            <div className="flex justify-center">
              <Paginador currentPage={currentPage} totalPages={totalPages} goToPage={goToPage} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default ReporteTrabajosSinMovimientos;