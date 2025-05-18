import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import Dashboard from "./pages/Dashboard";
import Messages from "./pages/Messages";
import Projects from "./pages/Projects";
import Project from "./pages/Project";
import Schedule from "./pages/Schedule";
import Activity from "./pages/Activity";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import PasswordRecovery from "./pages/PasswordRecovery";
import PageNotFound from "./pages/PageNotFound";
import AppLayout from "./ui/AppLayout";
import CustomizedToaster from "./ui/CustomizedToaster";
import ProtectedRoute from "./ui/ProtectedRoute";
import { updateTheme } from "./utils/helpers";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
    },
  },
});

function App() {
  const savedTheme = localStorage.getItem("theme");
  updateTheme(savedTheme);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate replace to="dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="messages" element={<Messages />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:projectId" element={<Project />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="activity" element={<Activity />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="passwordRecovery" element={<PasswordRecovery />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>

      <CustomizedToaster />
    </QueryClientProvider>
  );
}

export default App;
