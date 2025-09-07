import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import ReportFilter from "../components/report/ReportFilter";
import AllSaleBillReport from "../components/report/AllSaleBillReport";
import SummaryFilter from "../components/report/SummaryFilter";
import SaleSummaryReport from "../components/report/SaleSummaryReport";
import Notification from "../components/common/Notification";
import LoadingSpinner from "../components/common/LoadingSpinner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Report = () => {
  const { user } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("all-bills"); // "all-bills" | "summary"
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // วันที่ปัจจุบันในรูป YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchBranches();
    // โหลดค่า "เฉพาะวันนี้" ครั้งแรก
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
      const response = await axios.get(
        `${API_BASE_URL}/api/reports/all-bills`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          params: filters,
        }
      );
      setBills(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch bills");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/reports/summary`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: filters,
      });
      setSummary(response.data?.bills || []);
      setTotalPrice(response.data?.totalPrice || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch summary");
    } finally {
      setLoading(false);
    }
  };

  // กันพลาด: ถ้า filter ที่ส่งขึ้นมาไม่มี start/end date ให้เติมเป็น "วันนี้"
  const ensureTodayDates = (filters) => {
    const merged = { ...filters };
    if (!merged.startDate) merged.startDate = today;
    if (!merged.endDate) merged.endDate = today;
    return merged;
  };

  const handleAllBillsFilter = (filters) => {
    fetchAllBills(ensureTodayDates(filters));
  };

  const handleSummaryFilter = (filters) => {
    fetchSummary(ensureTodayDates(filters));
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
      setSuccess(response.data?.message || "Canceled");
      // หลังยกเลิกบิล ให้รีเฟรช “วันนี้”
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

        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setActiveTab("all-bills")}
            className={`px-4 py-2 rounded font-medium ${
              activeTab === "all-bills"
                ? "bg-primary text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-orange-100 cursor-pointer"
            }`}
          >
            All Sale Bills
          </button>
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-4 py-2 rounded font-medium ${
              activeTab === "summary"
                ? "bg-primary text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-orange-100 cursor-pointer"
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
              onCancel={handleCancel}
              isLoading={loading}
            />
          </>
        ) : (
          <>
            <SummaryFilter onFilter={handleSummaryFilter} />
            <SaleSummaryReport
              bills={summary}
              totalPrice={totalPrice}
              isLoading={loading}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Report;
