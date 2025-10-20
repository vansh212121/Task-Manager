import React from "react";
import { Provider } from "react-redux";
import { appStore } from "./redux/store";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import PersistLogin from "./components/auth/PersistLogin";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { Toaster } from "sonner";

const App = () => {
  return (
    <Provider store={appStore}>
      <Toaster/>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* PROTECTED AND PERSISTENCE COME HERE */}
          <Route element={<PersistLogin />}>
            <Route element={<ProtectedRoute/>}>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* NOT FOUND */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
