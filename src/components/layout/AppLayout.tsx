import { Outlet } from "react-router-dom";

import Header from "./Header";
import Sidebar from "./Sidebar";

function AppLayout() {
  return (
    <div className="app-layout">
      <Header />

      <div className="content">
        <Sidebar />

        <Outlet />
      </div>
    </div>
  );
}

export default AppLayout;
