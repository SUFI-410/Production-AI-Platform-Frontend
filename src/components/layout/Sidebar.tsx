import {
  FileCheck2,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navigationItems = [
  {
    end: true,
    icon: FileCheck2,
    label: "Invoice Preflight",
    to: "/",
  },
  {
    end: false,
    icon: MessageSquareText,
    label: "Knowledge Chat",
    to: "/chat",
  },
];

function Sidebar() {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-border bg-card/50 md:w-64 md:border-b-0 md:border-r">
      <nav
        aria-label="Product navigation"
        className="flex gap-2 p-3 md:flex-col md:p-4"
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              className={({ isActive }) =>
                [
                  "flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition md:flex-none",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")
              }
              end={item.end}
              key={item.to}
              to={item.to}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto hidden p-4 md:block">
        <div className="rounded-xl border border-border bg-background/70 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Tenant protected
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Documents and evaluations are isolated to your authenticated organization.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
