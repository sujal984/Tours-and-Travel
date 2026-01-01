import { Route, Routes } from "react-router-dom";
import { routes } from "./constant/route";
import NotFoundPage from "./components/common/NotFound";
import Forbidden from "./components/common/Forbidden";
import WithHelmet from "./components/HOC/WithHelmet";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import AdminProtectedRoute from "./Admin/ProtectedRoute";
import AdminLayout from "./Admin/Layout/AdminLayout";
import AdminLogin from "./Admin/Auth/Login";
import CustomerLayout from "./Customer/Layout/CustomerLayout";
import { Suspense } from "react";

function App() {
  return (
    <Routes>
      {/* Admin Login - MUST be before protected admin routes */}
      <Route
        path="/admin/login"
        element={
          <WithHelmet title="Admin Login">
            <Suspense fallback={<div>Loading...</div>}>
              <AdminLogin />
            </Suspense>
          </WithHelmet>
        }
      />

      {/* Admin Routes - wrapped in AdminLayout */}
      <Route
        path="/admin/*"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        {/* Nested admin routes */}
        {Object.values(routes)
          .filter((route) => route.path.startsWith("/admin") && route.path !== "/admin/login")
          .map((route) => {
            const Component = route.component;
            // Remove /admin prefix for nested routing
            const nestedPath = route.path === "/admin" ? "" : route.path.replace("/admin/", "");

            return (
              <Route
                key={route.path}
                path={nestedPath}
                element={
                  <WithHelmet title={route.title}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <Component />
                    </Suspense>
                  </WithHelmet>
                }
              />
            );
          })}
      </Route>

      {/* Customer Routes - wrapped in CustomerLayout */}
      <Route element={<CustomerLayout />}>
        {Object.values(routes)
          .filter((route) => !route.path.startsWith("/admin"))
          .map((route) => {
            const Component = route.component;
            const isPublicRoute = route.public || false;

            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  isPublicRoute ? (
                    <WithHelmet title={route.title}>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Component />
                      </Suspense>
                    </WithHelmet>
                  ) : (
                    // Protected customer routes
                    <ProtectedRoute>
                      <WithHelmet title={route.title}>
                        <Suspense fallback={<div>Loading...</div>}>
                          <Component />
                        </Suspense>
                      </WithHelmet>
                    </ProtectedRoute>
                  )
                }
              />
            );
          })}
      </Route>

      <Route path="/forbidden" element={<Forbidden />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
