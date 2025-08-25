import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
const ProtectedRoute = ({ allowedRoles }) => {
  const { auth, cargando } = useAuth();
  if (cargando) return <div>Cargando...</div>;
  
  // Verificar autenticación básica
  if (!auth || !auth.id) {
    return <Navigate to="/auth" />;
  }
  // Verificar roles si se especifican
  if (allowedRoles && !allowedRoles.includes(auth.rol)) {
    return <Navigate to="/" />;
  }
  return <Outlet />;
};
export default ProtectedRoute;