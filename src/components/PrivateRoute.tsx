import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();

  // Enquanto a autenticação inicial está carregando, pode-se renderizar um loader ou null
  // dependendo da UX desejada.
  if (loading) {
    return null; // Ou um componente de loading
  }

  // Se o usuário estiver autenticado, renderiza as rotas filhas
  if (isAuthenticated) {
    return <Outlet />;
  }

  // Se não estiver autenticado, redireciona para a página de login
  return <Navigate to="/login" replace />;
} 