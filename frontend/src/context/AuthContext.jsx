import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
export const AuthContext = createContext();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      console.log("AuthContext: Checking token:", token); // Debug
      if (token) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser({
            ...response.data.user,
            lastName: response.data.user.lastName || "",
          });
          console.log("AuthContext: User set:", response.data.user); // Debug
        } catch (error) {
          console.error("AuthContext: Failed to fetch user:", error);
          localStorage.removeItem("token");
          setUser(null);
          console.log("AuthContext: User set to null due to error"); // Debug
        }
      } else {
        setUser(null);
        console.log("AuthContext: No token, user is null"); // Debug
      }
      setLoading(false);
      console.log("AuthContext: Loading complete, loading:", false); // Debug
    };
    fetchUser();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser({ ...userData, lastName: userData.lastName || "" });
    console.log("AuthContext: Login, user set:", userData); // Debug
    navigate("/");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    console.log("AuthContext: Logout, user set to null"); // Debug
    navigate("/login");
  };

  if (loading) {
    console.log("AuthContext: Rendering loading screen"); // Debug
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
