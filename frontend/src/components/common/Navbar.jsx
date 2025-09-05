import { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import {
  FaHome,
  FaShoppingCart,
  FaFileAlt,
  FaList,
  FaBox,
  FaBuilding,
  FaUsers,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import scm_logo from "../../../public/SCM-Logo.png";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [branchName, setBranchName] = useState("");
  let timeoutId = null;

  console.log("Navbar: User:", user); // Debug

  useEffect(() => {
    if (user?.branchCode) {
      const fetchBranchName = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/branches`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          const branch = response.data.find(
            (b) => b.branchCode === user.branchCode
          );
          setBranchName(branch ? branch.branchName : user.branchCode);
          console.log(
            "Navbar: Branch Name:",
            branch ? branch.branchName : user.branchCode
          ); // Debug
        } catch (err) {
          console.error("Navbar: Failed to fetch branch name:", err);
          setBranchName(user?.branchCode || "Unknown Branch");
        }
      };
      fetchBranchName();
    } else {
      setBranchName("No Branch");
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleMouseEnter = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutId = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200); // Delay 200ms เพื่อให้มีเวลาเลื่อนไปกด Logout
  };

  const menuItems = [
    { name: "Home", path: "/", icon: <FaHome className="inline-block mr-1" /> },
    {
      name: "Sales",
      path: "/sale",
      icon: <FaShoppingCart className="inline-block mr-1" />,
    },
    {
      name: "Report",
      path: "/report",
      icon: <FaFileAlt className="inline-block mr-1" />,
    },
    ...(user?.role === "Admin"
      ? [
          {
            name: "Category",
            path: "/category",
            icon: <FaList className="inline-block mr-1" />,
          },
          {
            name: "Products",
            path: "/product",
            icon: <FaBox className="inline-block mr-1" />,
          },
          {
            name: "Branch",
            path: "/branch",
            icon: <FaBuilding className="inline-block mr-1" />,
          },
          {
            name: "Users",
            path: "/users",
            icon: <FaUsers className="inline-block mr-1" />,
          },
        ]
      : []),
  ];

  console.log(user);

  return (
    <nav className="bg-white text-black py-3 px-10 fixed top-0 w-full z-50 shadow-md">
      <div className="max-w-full mx-auto flex items-center justify-between">
        {/* ด้านซ้าย: Logo */}
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold flex items-center">
            <img src={scm_logo} alt="Logo" className="h-10 inline-block mr-2" />
          </Link>
        </div>
        {/* ตรงกลาง: เมนู (Desktop) */}
        <div className="hidden lg:flex space-x-4 font-semibold">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`px-3 py-2 rounded flex items-center ${
                location.pathname === item.path
                  ? "text-primary font-semibold"
                  : "hover:text-orange-600"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </div>
        {/* ด้านขวา: ข้อมูลผู้ใช้ */}
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className="flex items-center text-white py-2 px-3 rounded-full cursor-pointer bg-primary"
            onClick={toggleMenu} // ใช้ toggleMenu เพื่อให้ mobile ยัง toggle ได้
          >
            <FaUser className="mr-1" />
            <span className="font-semibold">{user?.lastName || "Guest"}</span>
          </div>
          <div
            className={`absolute right-0 mt-2 w-60 bg-white text-gray-600 rounded-lg border-t-4 border-primary shadow-lg ${
              isDropdownOpen ? "block" : "hidden"
            }`}
          >
            <div className="p-4">
              <p>
                <strong>Username:</strong> {user?.username || "-"}
              </p>
              <p>
                <strong>Last Name:</strong> {user?.lastName || "-"}
              </p>
              <p>
                <strong>Branch Name:</strong> {user?.branchCode || "-"}
              </p>
              <p>
                <strong>Role:</strong> {user?.role || "-"}
              </p>
              <button
                onClick={handleLogout}
                className="mt-2 w-full bg-primary text-white p-2 rounded-md hover:bg-primary-dark text-sm flex items-center justify-center"
              >
                <FaSignOutAlt className="mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
        {/* Hamburger Menu (Mobile) */}
        <div className="lg:hidden">
          <button
            onClick={toggleMenu}
            className="text-black focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
              />
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden mt-4 bg-white p-4 rounded shadow-md">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`px-3 py-2 rounded flex items-center ${
                location.pathname === item.path
                  ? "bg-primary text-white"
                  : "hover:bg-primary hover:text-white"
              }`}
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
