import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import AuthPage from "./pages/auth/AuthPage";
import PasswordResetPage from "./pages/auth/PasswordResetPage";
import ChatPage from "./pages/chat/ChatPage";
import LandingPage from "./pages/landing/LandingPage";
import PreflightPage from "./pages/preflight/PreflightPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<LandingPage />} />
        <Route path="auth" element={<AuthPage />} />
        <Route path="forgot-password" element={<PasswordResetPage key="request" mode="request" />} />
        <Route path="reset-password" element={<PasswordResetPage key="confirm" mode="confirm" />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
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
