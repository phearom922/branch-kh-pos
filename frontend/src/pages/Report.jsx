import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import ReportFilter from "../components/report/ReportFilter";
import AllSaleBillReport from "../components/report/AllSaleBillReport";
import SummaryFilter from "../components/report/SummaryFilter";
import SaleSummaryReport from "../components/report/SaleSummaryReport";
// ...existing code...
import Notification from "../components/common/Notification";
import LoadingSpinner from "../components/common/LoadingSpinner";
// ...existing code...
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Report = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("all-bills");
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0]; // วันที่ปัจจุบัน

  useEffect(() => {
    fetchBranches();
    fetchAllBills({ startDate: today, endDate: today });
    fetchSummary({ startDate: today, endDate: today });
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchBranches = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/branches`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBranches(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch branches");
    }
  };

  const fetchAllBills = async (filters = {}) => {
    setLoading(true);
    try {
      console.log("Fetching all bills with filters:", filters);
      const response = await axios.get(
        `${API_BASE_URL}/api/reports/all-bills`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          params: filters,
        }
      );
      console.log("All Bills Response:", response.data);
      setBills(response.data);
    } catch (err) {
      console.error("Error fetching all bills:", err.response?.data);
      setError(err.response?.data?.message || "Failed to fetch bills");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async (filters = {}) => {
    setLoading(true);
    try {
      console.log("Fetching summary with filters:", filters);
      const response = await axios.get(`${API_BASE_URL}/api/reports/summary`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: filters,
      });
      console.log("Summary Response:", response.data);
      setSummary(response.data.bills);
      setTotalPrice(response.data.totalPrice);
    } catch (err) {
      console.error("Error fetching summary:", err.response?.data);
      setError(err.response?.data?.message || "Failed to fetch summary");
    } finally {
      setLoading(false);
    }
  };

  const handleAllBillsFilter = (filters) => {
    fetchAllBills(filters);
  };

  const handleSummaryFilter = (filters) => {
    fetchSummary(filters);
  };

  const handleCancel = async (id) => {
    setError("");
    setSuccess("");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/reports/cancel/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSuccess(response.data.message);
      fetchAllBills({ startDate: today, endDate: today });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel bill");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-10/12 mx-auto">
        <h2 className="text-2xl font-bold mb-6">Reports</h2>
        {error && <Notification message={error} type="error" />}
        {success && <Notification message={success} type="success" />}
        {/* {loading && <LoadingSpinner />} */}
        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab("all-bills")}
            className={`px-4 py-2 mr-2 rounded ${
              activeTab === "all-bills"
                ? "bg-primary text-white"
                : "bg-gray-200"
            }`}
          >
            All Sale Bill Report
          </button>
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-4 py-2 rounded ${
              activeTab === "summary" ? "bg-primary text-white" : "bg-gray-200"
            }`}
          >
            Sale Summary Report
          </button>
        </div>
        {activeTab === "all-bills" ? (
          <>
            <ReportFilter
              onFilter={handleAllBillsFilter}
              branches={branches}
              user={user}
            />
            <AllSaleBillReport
              bills={bills}
              user={user}
              onCancel={handleCancel}
            />
          </>
        ) : (
          <>
            <SummaryFilter onFilter={handleSummaryFilter} />
            <SaleSummaryReport bills={summary} totalPrice={totalPrice} />
          </>
        )}
      </div>
    </div>
  );
};

export default Report;
