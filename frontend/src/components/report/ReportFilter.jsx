import { useState, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/**
 * Props:
 * - onFilter: (filters) => void
 * - branches: []  (list ของสาขา)
 * - user: { role, branchCode }
 */
const ReportFilter = ({ onFilter, branches = [], user }) => {
  // ใช้ Date object ใน state สำหรับ react-datepicker
  const todayDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [startDate, setStartDate] = useState(todayDate);
  const [endDate, setEndDate] = useState(todayDate);
  const [branchCode, setBranchCode] = useState(
    user?.role === "Cashier" ? user?.branchCode || "" : ""
  );
  const [billStatus, setBillStatus] = useState("");
  const [billType, setBillType] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [memberName, setMemberName] = useState("");
  const [recordBy, setRecordBy] = useState("");

  // ถ้า role = Cashier ให้ lock branch
  const isCashier = user?.role === "Cashier";

  // แปลง Date -> YYYY-MM-DD
  const toYMD = (d) => {
    if (!d) return null;
    const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
    return iso;
  };

  // ส่งฟิลเตอร์ขึ้นไป
  const applyFilter = () => {
    const payload = {
      startDate: toYMD(startDate) || toYMD(todayDate),
      endDate: toYMD(endDate) || toYMD(todayDate),
    };

    if (branchCode) payload.branchCode = branchCode;
    if (billStatus) payload.billStatus = billStatus;
    if (billType) payload.billType = billType;
    if (billNumber) payload.billNumber = billNumber;
    if (memberName) payload.memberName = memberName;
    if (recordBy) payload.recordBy = recordBy;

    onFilter?.(payload);
  };

  const clearFilter = () => {
    setStartDate(todayDate);
    setEndDate(todayDate);
    setBillStatus("");
    setBillType("");
    setBillNumber("");
    setMemberName("");
    setRecordBy("");
    if (!isCashier) setBranchCode("");
    // ส่ง “วันนี้” กลับขึ้นไปทันที
    onFilter?.({
      startDate: toYMD(todayDate),
      endDate: toYMD(todayDate),
      ...(isCashier && user?.branchCode ? { branchCode: user.branchCode } : {}),
    });
  };

  // เรียก apply ครั้งแรกให้แน่ใจว่า parent ได้ค่า “วันนี้”
  useEffect(() => {
    onFilter?.({
      startDate: toYMD(todayDate),
      endDate: toYMD(todayDate),
      ...(isCashier && user?.branchCode ? { branchCode: user.branchCode } : {}),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white p-4 rounded-md shadow mb-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          applyFilter();
        }}
        className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
      >
        {/* Date range */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <DatePicker
            selected={startDate}
            onChange={(d) => setStartDate(d)}
            dateFormat="yyyy-MM-dd"
            className="w-full border border-gray-400 rounded px-2 py-2 text-sm"
            maxDate={endDate || undefined}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            End Date
          </label>
          <DatePicker
            selected={endDate}
            onChange={(d) => setEndDate(d)}
            dateFormat="yyyy-MM-dd"
            className="w-full border border-gray-400 rounded px-2 py-2 text-sm"
            minDate={startDate || undefined}
          />
        </div>

        {/* Branch */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Branch
          </label>
          <select
            disabled={isCashier}
            value={branchCode}
            onChange={(e) => setBranchCode(e.target.value)}
            className="w-full border border-gray-400 rounded px-2 py-2 text-sm disabled:bg-gray-100"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b.branchCode} value={b.branchCode}>
                {b.branchCode} - {b.branchName}
              </option>
            ))}
          </select>
        </div>

        {/* Bill Status */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Bill Status
          </label>
          <select
            value={billStatus}
            onChange={(e) => setBillStatus(e.target.value)}
            className="w-full border border-gray-400 rounded px-2 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="Completed">Completed</option>
            <option value="Canceled">Canceled</option>
          </select>
        </div>

        {/* Bill Type */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Bill Type
          </label>
          <select
            value={billType}
            onChange={(e) => setBillType(e.target.value)}
            className="w-full border border-gray-400 rounded px-2 py-2 text-sm"
          >
            <option value="">All Types</option>
            <option value="CMC">CMC</option>
            <option value="STK">STK</option>
          </select>
        </div>

        {/* Bill No */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Bill Number
          </label>
          <input
            value={billNumber}
            onChange={(e) => setBillNumber(e.target.value)}
            className="w-full border border-gray-400 rounded px-2 py-2 text-sm"
            placeholder="e.g. INV-0001"
          />
        </div>

        {/* Member */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Member Name
          </label>
          <input
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            className="w-full border border-gray-400 rounded px-2 py-2 text-sm"
            placeholder="Member name"
          />
        </div>

        {/* Record By */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Record By
          </label>
          <input
            value={recordBy}
            onChange={(e) => setRecordBy(e.target.value)}
            className="w-full border border-gray-400 rounded px-2 py-2 text-sm"
            placeholder="Username Staff"
          />
        </div>

        {/* Actions */}
        <div className="md:col-span-4 flex gap-2 justify-end">
          <button
            type="submit"
            className="bg-orange-600 text-white px-4 py-2 rounded shadow hover:bg-orange-700 text-sm"
          >
            Apply Filter
          </button>
          <button
            type="button"
            onClick={clearFilter}
            className="bg-gray-500 text-white px-4 py-2 rounded shadow hover:bg-gray-600 text-sm"
          >
            Clear Filter (Today)
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportFilter;
