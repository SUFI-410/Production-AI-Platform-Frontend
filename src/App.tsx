import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import AuthPage from "./pages/auth/AuthPage";
import ChatPage from "./pages/chat/ChatPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={<AuthPage />}
          path="auth"
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route
              element={<ChatPage />}
              index
            />

            <Route
              element={<ChatPage />}
              path="chat"
            />
          </Route>
        </Route>

        <Route
          element={<Navigate replace to="/" />}
          path="*"
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
