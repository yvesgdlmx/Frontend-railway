import React, { useState, useEffect } from 'react';
import clienteAxios from '../../config/clienteAxios';
import { BsToggleOn, BsToggleOff } from 'react-icons/bs';
import swal from 'sweetalert';
import Heading from '../components/others/Heading';
const CargarMedia = () => {
  const [mediaList, setMediaList] = useState([]);
  const [archivo, setArchivo] = useState(null);
  const [descripcion, setDescripcion] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  // URL base del backend (sin el "/api") para cargar imágenes/videos
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  // Función para obtener las medias
  const fetchMedia = async () => {
    try {
      const response = await clienteAxios.get('/media');
      setMediaList(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al obtener las medias');
    }
  };
  useEffect(() => {
    fetchMedia();
  }, []);
  // Manejar la selección del archivo
  const handleFileChange = (ev) => {
    setArchivo(ev.target.files[0]);
  };
  // Función para enviar el formulario y subir el archivo
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!archivo) {
      setError('Debes seleccionar un archivo');
      return;
    }
    setError('');
    setCargando(true);
    try {
      const formData = new FormData();
      formData.append('media', archivo);
      formData.append('descripcion', descripcion);
      const response = await clienteAxios.post('/media/crear', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMediaList((prev) => [...prev, response.data]);
      setArchivo(null);
      setDescripcion('');
      document.getElementById('archivoInput').value = '';
    } catch (err) {
      console.error(err);
      setError('Error al subir el archivo');
    } finally {
      setCargando(false);
    }
  };
  // Función para cambiar el estado de la media
  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const response = await clienteAxios.patch(`/media/${id}/estado`, {
        estado: nuevoEstado,
      });
      setMediaList((prev) =>
        prev.map((item) => (item.id === id ? response.data : item))
      );
    } catch (err) {
      console.error(err);
      setError('Error al cambiar el estado');
    }
  };
  // Función para eliminar una media usando SweetAlert para confirmar
  const confirmarEliminar = (id) => {
    swal({
      title: "¿Estás seguro?",
      text: "Una vez eliminada, no podrás recuperar esta media.",
      icon: "warning",
      buttons: ["Cancelar", "Sí, eliminar"],
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          await clienteAxios.delete(`/media/eliminar/${id}`);
          setMediaList((prev) => prev.filter((item) => item.id !== id));
          swal("¡La media ha sido eliminada!", {
            icon: "success",
          });
        } catch (err) {
          console.error(err);
          setError('Error al eliminar la media');
        }
      }
    });
  };
  // Componente Switch utilizando React Icons
  const Switch = ({ checked, onChange }) => {
    return (
      <div onClick={onChange} className="cursor-pointer">
        {checked ? (
          <BsToggleOn className="text-green-500 text-4xl" />
        ) : (
          <BsToggleOff className="text-gray-500 text-4xl" />
        )}
      </div>
    );
  };
  return (
    <div className="md:full lg:w-full xl:w-4/5 mx-auto px-8 font-sans">
      <div className="md:mt-2 xs:mt-6">
        <Heading title={'Gestión de Avisos'}/>
      </div>
      {error && <p className="text-center text-red-500 mb-4">{error}</p>}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="archivoInput" className="block text-gray-700 font-semibold mb-2">
              Archivo:
            </label>
            <input
              id="archivoInput"
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Descripción:
            </label>
            <input
              type="text"
              value={descripcion}
              onChange={(ev) => setDescripcion(ev.target.value)}
              placeholder="Descripción del archivo"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            type="submit"
            disabled={cargando}
            className="py-3 px-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors duration-300 uppercase text-sm"
          >
            {cargando ? 'Subiendo...' : 'Subir Archivo'}
          </button>
        </form>
      </div>
      <hr className="mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mediaList.map((media) => (
          <div key={media.id} className="relative bg-white shadow rounded-lg p-4 flex flex-col items-center">
            {/* Botón de eliminar (X) en la esquina superior derecha */}
            <button
              onClick={() => confirmarEliminar(media.id)}
              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xl font-bold pb-3 pt-2 pl-3 pr-3"
              title="Eliminar"
            >
              &times;
            </button>
            {media.nombre.match(/\.(jpg|jpeg|png|gif)$/i) ? (
              <img
                src={media.url || `${backendUrl}/uploads/${media.nombre}`}
                alt={media.descripcion}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
            ) : (
              <video controls className="w-full h-48 rounded-md mb-4">
                <source src={`${backendUrl}/uploads/${media.nombre}`} type="video/mp4" />
                Tu navegador no soporta este video.
              </video>
            )}
            <p className="mb-2">
              <strong>Descripción:</strong> {media.descripcion}
            </p>
            <div className="flex items-center gap-2">
              <span className="font-medium">{media.estado ? 'Activo' : 'Inactivo'}</span>
              <Switch checked={media.estado} onChange={() => cambiarEstado(media.id, !media.estado)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default CargarMedia;