import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ReportFilter = ({ onFilter, branches, user }) => {
  const today = new Date().toISOString().split("T")[0]; // วันที่ปัจจุบันใน YYYY-MM-DD
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [branchCode, setBranchCode] = useState(
    user.role === "Cashier" ? user.branchCode : ""
  );
  const [billStatus, setBillStatus] = useState("");
  const [billType, setBillType] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [memberName, setMemberName] = useState("");
  const [recordBy, setRecordBy] = useState("");

  useEffect(() => {
    console.log("ReportFilter: Initial filter:", {
      startDate,
      endDate,
      branchCode,
      billStatus,
      billType,
      billNumber,
      memberName,
      recordBy,
    });
    onFilter({
      startDate,
      endDate,
      branchCode,
      billStatus,
      billType,
      billNumber,
      memberName,
      recordBy,
    });
  }, []);

  const formatDate = (date) => {
    if (!date) return "";
    // ใช้ local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleApplyFilter = () => {
    const filters = {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      branchCode,
      billStatus,
      billType,
      billNumber,
      memberName,
      recordBy,
    };
    console.log("ReportFilter: Apply filter:", filters);
    onFilter(filters);
  };

  const handleClearTypes = () => {
    setStartDate(today);
    setEndDate(today);
    setBranchCode(user.role === "Cashier" ? user.branchCode : "");
    setBillStatus("");
    setBillType("");
    setBillNumber("");
    setMemberName("");
    setRecordBy("");
    console.log("ReportFilter: Clear filter:", {
      startDate: today,
      endDate: today,
      branchCode: user.role === "Cashier" ? user.branchCode : "",
      billStatus: "",
      billType: "",
      billNumber: "",
      memberName: "",
      recordBy: "",
    });
    onFilter({
      startDate: today,
      endDate: today,
      branchCode: user.role === "Cashier" ? user.branchCode : "",
      billStatus: "",
      billType: "",
      billNumber: "",
      memberName: "",
      recordBy: "",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <form className="flex flex-col gap-4">
        {/* แถวบน */}
        <div className="flex flex-row flex-wrap gap-4 items-center">
          {/* Start Date */}
          <div className="relative min-w-[140px]">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select Start Date"
              className="border rounded px-3 py-2 w-full"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500">
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6 2a1 1 0 00-1 1v1H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2h-.001V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM5 6h10v10H5V6z" />
              </svg>
            </span>
          </div>
          {/* End Date */}
          <div className="relative min-w-[140px]">
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select End Date"
              className="border rounded px-3 py-2 w-full"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500">
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6 2a1 1 0 00-1 1v1H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2h-.001V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM5 6h10v10H5V6z" />
              </svg>
            </span>
          </div>
          {/* Branches */}
          {user.role === "Admin" && (
            <select
              value={branchCode}
              onChange={(e) => setBranchCode(e.target.value)}
              className="border rounded px-3 py-2 min-w-[410px]"
            >
              <option value="">All Branches</option>
              {branches.map((branch) => (
                <option key={branch._id} value={branch.branchCode}>
                  {branch.branchCode} - {branch.branchName}
                </option>
              ))}
            </select>
          )}
          {/* Statuses */}
          <select
            value={billStatus}
            onChange={(e) => setBillStatus(e.target.value)}
            className="border rounded px-3 py-2 min-w-[155px]"
          >
            <option value="">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Canceled">Canceled</option>
          </select>
          {/* Types */}
          <select
            value={billType}
            onChange={(e) => setBillType(e.target.value)}
            className="border rounded px-3 py-2 min-w-[155px]"
          >
            <option value="">All Types</option>
            <option value="CMC">CMC</option>
            <option value="STK">STK</option>
          </select>
          {/* Apply Filter */}
          <button
            type="button"
            onClick={handleApplyFilter}
            className="bg-orange-500 text-white px-6 py-3 rounded font-semibold shadow hover:bg-orange-600 transition-colors text-sm ml-auto"
          >
            Apply Filter
          </button>
        </div>
        {/* แถวล่าง */}
        <div className="flex flex-row flex-wrap gap-4 items-center">
          {/* Member Name */}
          <div className="relative">
            <input
              type="text"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="Member Name"
              className="border rounded px-6 py-2 min-w-[180px]"
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-orange-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </span>
          </div>
          {/* Record By */}
          <div className="relative">
            <input
              type="text"
              value={recordBy}
              onChange={(e) => setRecordBy(e.target.value)}
              placeholder="Record By"
              className="border rounded px-6 py-2 min-w-[180px]"
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-orange-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="size-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </span>
          </div>
          {/* Bill Number */}
          <div className="relative">
            <input
              type="text"
              value={billNumber}
              onChange={(e) => setBillNumber(e.target.value)}
              placeholder="Bill Number"
              className="border rounded px-6 py-2 min-w-[180px]"
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-orange-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="size-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </span>
          </div>
          {/* Clear Types */}
          <button
            type="button"
            onClick={handleClearTypes}
            className="bg-gray-500 text-white px-6 py-3 rounded font-semibold shadow hover:bg-gray-600 transition-colors text-sm ml-auto"
          >
            Clear Filter
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportFilter;
