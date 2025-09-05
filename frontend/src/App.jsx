import { Routes, Route } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Navbar from "./components/common/Navbar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Branch from "./pages/Branch";
import Users from "./pages/Users";
import Sale from "./pages/Sale";
import Category from "./pages/Category";
import Product from "./pages/Product";
import Report from "./pages/Report";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/common/PrivateRoute";
import { useContext } from "react";

const AppContent = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    console.log("AppContent: Loading user data..."); // Debug
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  console.log("AppContent: User status:", user); // Debug

  return (
    <div className="flex flex-col min-h-screen">
      {user && <Navbar />}
      <div className={`flex-grow ${user ? "mt-16" : ""}`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/branch"
            element={
              <PrivateRoute allowedRoles={["Admin"]}>
                <Branch />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute allowedRoles={["Admin"]}>
                <Users />
              </PrivateRoute>
            }
          />
          <Route
            path="/sale"
            element={
              <PrivateRoute allowedRoles={["Admin", "Cashier"]}>
                <Sale />
              </PrivateRoute>
            }
          />
          <Route
            path="/category"
            element={
              <PrivateRoute allowedRoles={["Admin"]}>
                <Category />
              </PrivateRoute>
            }
          />
          <Route
            path="/product"
            element={
              <PrivateRoute allowedRoles={["Admin"]}>
                <Product />
              </PrivateRoute>
            }
          />
          <Route
            path="/report"
            element={
              <PrivateRoute allowedRoles={["Admin", "Cashier"]}>
                <Report />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
