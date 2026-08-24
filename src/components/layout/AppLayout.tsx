import { Outlet } from "react-router-dom";

import Header from "./Header";
import Sidebar from "./Sidebar";

function AppLayout() {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background">
      <Header />

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <Sidebar />
        <Outlet />
      </div>
    </div>
  );
}

export default AppLayout;
