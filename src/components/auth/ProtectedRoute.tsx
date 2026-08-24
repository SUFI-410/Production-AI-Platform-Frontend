import { useEffect } from "react";
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useCurrentUser } from "../../hooks/useAuth";
import { useAuthStore } from "../../store/authStore";

function ProtectedRoute() {
  const location = useLocation();

  const accessToken = useAuthStore(
    (state) => state.accessToken,
  );

  const setUser = useAuthStore(
    (state) => state.setUser,
  );

  const clearSession = useAuthStore(
    (state) => state.clearSession,
  );

  const {
    data: user,
    isPending,
    isError,
  } = useCurrentUser();

  useEffect(() => {
    if (
      accessToken !== null &&
      user !== undefined
    ) {
      setUser(user);
    }
  }, [
    accessToken,
    setUser,
    user,
  ]);

  useEffect(() => {
    if (isError) {
      clearSession();
    }
  }, [
    clearSession,
    isError,
  ]);

  if (accessToken === null || isError) {
    return (
      <Navigate
        replace
        state={{ from: location }}
        to="/auth"
      />
    );
  }

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />

          <p className="mt-4 text-sm text-muted-foreground">
            Securing your workspace...
          </p>
        </div>
      </main>
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
