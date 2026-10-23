import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Wrap a page: <ProtectedRoute><Upload /></ProtectedRoute>
// Add adminOnly for admin pages: <ProtectedRoute adminOnly>...</ProtectedRoute>
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // still checking for an existing session

  if (!isAuthenticated) {
    // Remember where the user wanted to go, Login sends them back there
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return children;
}