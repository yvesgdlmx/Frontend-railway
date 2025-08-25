import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
const ProtectedRoute = () => {
  const { auth, cargando } = useAuth();
  if (cargando) return <div>Cargando...</div>;
  return auth && auth.id ? <Outlet /> : <Navigate to="/auth" />;
};
export default ProtectedRoute;