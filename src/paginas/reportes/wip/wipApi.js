import clienteAxios from '../../../../config/clienteAxios';

const base = '/reportes/proyeccion-wip';
export async function wipApi(path, options = {}) {
  const { data } = await clienteAxios({
    ...options, url: `${base}${path}`,
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, ...options.headers },
  });
  return data;
}
export const errorMessage = (error) => error.response?.data?.msg || 'No se pudo completar la solicitud';
export const number = (value) => value === null || value === undefined ? '--' : Number(value).toLocaleString('es-MX');
export const dayLabel = (date) => new Date(`${date}T12:00:00`).toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
