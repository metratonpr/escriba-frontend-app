// src/components/auth/PrivateRoute.tsx
import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";

type Props = {
  children: ReactElement;
};

export default function PrivateRoute({ children }: Props) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}
