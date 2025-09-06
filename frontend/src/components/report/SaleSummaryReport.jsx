import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import * as XLSX from "xlsx";

const SaleSummaryReport = ({ bills, recordByFilter, isLoading = false }) => {
  const { user } = useContext(AuthContext);
  const [activeBranch, setActiveBranch] = useState(
    user?.role === "Cashier" ? user?.branchCode || "PNH" : "PNH"
  );

  // กำหนด branch tabs ตาม role
  const branchTabs =
    user?.role === "Cashier"
      ? [user?.branchCode].filter(Boolean) // แสดงเฉพาะ branch ของ Cashier
      : ["PNH", "KCM"]; // Admin เห็นทุก branch

  // กรองตาม branch
  const branchBills = bills.filter((bill) => bill.branchCode === activeBranch);

  // กรองตาม staff ถ้ามี filter
  const filteredBills = recordByFilter
    ? branchBills.filter((bill) => bill.recordBy === recordByFilter)
    : branchBills;

  // สรุปตาม billType
  const summaryData = Object.values(
    filteredBills.reduce((acc, bill) => {
      const key = bill.billType;
      if (!acc[key]) {
        acc[key] = {
          billType: bill.billType,
          billAmount: 0,
          totalPrice: 0,
          recordBy: recordByFilter ? bill.recordBy : "All Staff",
          branchCode: activeBranch,
        };
      }
      acc[key].billAmount += bill.billAmount;
      acc[key].totalPrice += bill.totalPrice;
      return acc;
    }, {})
  );

  const branchTotal = summaryData.reduce((sum, b) => sum + b.totalPrice, 0);

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      summaryData.map((row) => ({
        "Bill Type": row.billType,
        "Bill Amount": row.billAmount,
        "Total Price": row.totalPrice,
        "Record Staff": row.recordBy,
        "Branch Code": row.branchCode,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sale Summary");
    XLSX.writeFile(wb, `SaleSummary_${activeBranch}.xlsx`);
  };

  return (
    <div className="bg-white p-6 rounded shadow-md">
      {/* Tabs */}
      <div className="flex space-x-4 mb-4 border-b border-gray-300">
        {branchTabs.map((branch) => (
          <button
            key={branch}
            onClick={() => setActiveBranch(branch)}
            className={`px-4 py-2 font-medium ${
              activeBranch === branch
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {branch}
          </button>
        ))}
      </div>
      {/* Export button */}
      <button
        onClick={handleExportExcel}
        className="mb-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark text-sm"
      >
        Export {activeBranch} to Excel
      </button>
      {/* Table */}
      <table className="w-full text-sm rounded-md ring-1 ring-gray-200 overflow-hidden">
        <thead className="text-gray-600">
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Bill Type</th>
            <th className="p-2 text-left">Bill Amount</th>
            <th className="p-2 text-left">Total Price</th>
            <th className="p-2 text-left">Record Staff</th>
            <th className="p-2 text-left">Branch Code</th>
          </tr>
        </thead>
        {isLoading ? (
          <td colSpan={13} className="px-4 py-8 text-center">
            <div className="p-8 flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
            Loading data...
          </td>
        ) : (
          <tbody>
            {summaryData.map((row, index) => (
              <tr
                key={index}
                className="border-b border-gray-200 font-semibold text-gray-600"
              >
                <td className="p-2">{row.billType}</td>
                <td className="p-2">{row.billAmount}</td>
                <td className="p-2">{row.totalPrice}</td>
                <td className="p-2">{row.recordBy}</td>
                <td className="p-2">{row.branchCode}</td>
              </tr>
            ))}
            <tr className="font-bold bg-primary text-xl">
              <td colSpan="2" className="p-2 text-right text-white">
                Total Price ({activeBranch}):
              </td>
              <td className="p-2 text-white">{branchTotal.toFixed(2)}</td>
              <td colSpan="2"></td>
            </tr>
          </tbody>
        )}
      </table>
    </div>
  );
};

export default SaleSummaryReport;
