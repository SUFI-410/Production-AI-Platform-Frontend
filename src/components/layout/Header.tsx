import { useQueryClient } from "@tanstack/react-query";
import {
  FileCheck2,
  LogOut,
} from "lucide-react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useHealth } from "../../hooks/useHealth";
import { useAuthStore } from "../../store/authStore";
import { usePreflightStore } from "../../store/preflightStore";

function getInitials(email: string | undefined): string {
  if (!email) {
    return "U";
  }

  return email.charAt(0).toUpperCase();
}

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useHealth();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore(
    (state) => state.clearSession,
  );

  const isChat = location.pathname === "/chat";

  let status = "Checking";
  let statusClass = "bg-amber-500";

  if (isError) {
    status = "Offline";
    statusClass = "bg-red-500";
  } else if (!isLoading && data) {
    status = "Healthy";
    statusClass = "bg-emerald-500";
  }

  const logout = () => {
    usePreflightStore.getState().resetWorkspace();
    sessionStorage.removeItem(
      "invoice-preflight-workspace",
    );
    queryClient.clear();
    clearSession();
    navigate("/auth", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <FileCheck2 className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-bold text-foreground sm:text-base">
              Invoice Preflight
            </p>
            <span className="hidden rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:inline">
              MVP
            </span>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {isChat ? "Knowledge Chat" : "Payment readiness workspace"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div
          className="hidden items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground sm:flex"
          title={`API version ${data?.version ?? "unknown"}`}
        >
          <span className={`h-2 w-2 rounded-full ${statusClass}`} />
          {status}
        </div>

        <div className="hidden min-w-0 items-center gap-2 md:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {getInitials(user?.email)}
          </div>
          <span className="max-w-48 truncate text-xs font-medium text-foreground">
            {user?.email ?? "Authenticated user"}
          </span>
        </div>

        <button
          aria-label="Log out"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          onClick={logout}
          title="Log out"
          type="button"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
