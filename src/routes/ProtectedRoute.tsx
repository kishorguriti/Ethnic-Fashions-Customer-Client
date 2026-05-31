import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks";
import type { JSX } from "react";

interface Props {
  children: JSX.Element;
  role?: "admin" | "customer";
}

const ProtectedRoute = ({ children, role }: Props) => {
  const user = useAppSelector((state) => state.auth.user);
  const location = useLocation();

  if (!user) {
    // Redirect to login, preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin check: CustomerUser has no role field, so admin routes
  // should only be protected at the server/token level.
  // For now, treat any authenticated user as "customer".
  if (role === "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
