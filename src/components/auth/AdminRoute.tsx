import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import Spinner from "../Layout/ui/Spinner";
import {
  fetchCurrentUser,
  getStoredToken,
  getStoredUser,
  isAdminUser,
  type AuthUser,
} from "../../services/authService";

type Props = {
  children: ReactElement;
};

export default function AdminRoute({ children }: Props) {
  const token = getStoredToken();
  const cachedUser = useMemo(() => getStoredUser(), []);
  const [user, setUser] = useState<AuthUser | null>(cachedUser);
  const [isChecking, setIsChecking] = useState(
    Boolean(token) && (!cachedUser || typeof cachedUser.is_admin !== "boolean")
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    if (user && typeof user.is_admin === "boolean") {
      setIsChecking(false);
      return;
    }

    const loadUser = async () => {
      try {
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(getStoredUser());
      } finally {
        setIsChecking(false);
      }
    };

    void loadUser();
  }, [token, user]);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (isChecking) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isAdminUser(user)) {
    return <Navigate to="/backoffice/dashboard" replace />;
  }

  return children;
}
