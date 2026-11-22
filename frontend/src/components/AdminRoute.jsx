import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F2EC] text-[#092F33]">
        <p className="text-sm text-[#84948C]">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.is_staff) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;
