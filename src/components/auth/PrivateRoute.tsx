// src/components/auth/PrivateRoute.tsx
import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { getStoredToken } from "../../services/authService";

type Props = {
  children: ReactElement;
};

export default function PrivateRoute({ children }: Props) {
  const token = getStoredToken();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}
