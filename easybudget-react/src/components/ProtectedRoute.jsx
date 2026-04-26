import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const currentUser = localStorage.getItem('currentUser');
  const token = localStorage.getItem('token');

  if (!currentUser || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
