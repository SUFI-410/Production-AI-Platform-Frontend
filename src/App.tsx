import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import AuthPage from "./pages/auth/AuthPage";
import ChatPage from "./pages/chat/ChatPage";
import PreflightPage from "./pages/preflight/PreflightPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="auth" element={<AuthPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<PreflightPage />} />
            <Route path="invoice-preflight" element={<PreflightPage />} />
            <Route path="chat" element={<ChatPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
