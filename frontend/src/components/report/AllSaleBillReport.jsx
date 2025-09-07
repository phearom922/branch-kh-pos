import { useState, useContext, useMemo, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Notification from "../common/Notification";
import { AuthContext } from "../../context/AuthContext";
import NotoSans from "../../fonts/NotoSans";

const AllSaleBillReport = ({ bills, onCancel, isLoading = false }) => {
  const { user } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [cancelingId, setCancelingId] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // all | summary
  const [selectedBranch, setSelectedBranch] = useState("");
  // State สำหรับ pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25; // จำนวนรายการต่อหน้า

  const hasBills = Array.isArray(bills) && bills.length > 0;

  // คำนวณ pagination
  const totalPages = Math.ceil(bills.length / itemsPerPage);
  const currentBills = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return bills.slice(startIndex, startIndex + itemsPerPage);
  }, [bills, currentPage, itemsPerPage]);

  // ฟังก์ชันเปลี่ยนหน้า
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // สร้าง array ของเลขหน้าเพื่อแสดง
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5; // จำนวนหน้าที่แสดง

    if (totalPages <= maxVisiblePages) {
      // ถ้ามีหน้าน้อยกว่า maxVisiblePages ให้แสดงทั้งหมด
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // ถ้ามีหน้ามากกว่า ให้แสดงบางส่วน
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = endPage - maxVisiblePages + 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  // รีเซ็ตหน้าเมื่อ bills เปลี่ยน
  useEffect(() => {
    setCurrentPage(1);
  }, [bills]);

  // -------------------- PDF --------------------
  const handleViewPDF = (bill) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    if (NotoSans?.font) {
      doc.addFileToVFS("NotoSans.ttf", NotoSans.font);
      doc.addFont("NotoSans.ttf", "NotoSans", "normal");
    }
    const pageWidth = doc.internal.pageSize.getWidth();
    const halfHeight = doc.internal.pageSize.getHeight() / 2;

    const drawInvoice = (yStart) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("INVOICE", pageWidth / 2, yStart + 10, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(user?.branchName || "Unknown Branch", 15, yStart + 20);
      doc.setFont("helvetica", "normal");
      doc.text(user?.address || "Unknown Address", 15, yStart + 26);

      let y = yStart + 35;
      doc.text(`Bill No: ${bill.billNumber}`, 15, y);
      doc.text(
        `Invoice Date: ${new Date(bill.createdAt).toLocaleString()}`,
        120,
        y
      );
      y += 5;
      if (NotoSans?.font) doc.setFont("NotoSans", "normal");
      doc.text(`Member Name: ${bill.memberName || "-"}`, 15, y);
      doc.text(`Member ID: ${bill.memberId || "-"}`, 120, y);
      y += 5;
      doc.text(`Type: ${bill.purchaseType || "N/A"}`, 15, y);
      doc.text(`Recorded By: ${bill.recordBy || "N/A"}`, 120, y);

      const items = bill.items || [];
      const tableData = items.map((item, index) => [
        index + 1,
        item.productCode || "N/A",
        item.productName || "N/A",
        item.amount || 0,
        (item.unitPrice || 0).toFixed(2),
        ((item.amount || 0) * (item.unitPrice || 0)).toFixed(2),
      ]);

      autoTable(doc, {
        startY: y + 5,
        head: [["No", "Code", "Product Name", "Qty", "Unit Price", "Total"]],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: {
          fillColor: [132, 132, 132],
          textColor: [255, 255, 255],
          halign: "center",
        },
        bodyStyles: { halign: "center" },
        columnStyles: {
          0: { cellWidth: 12 },
          1: { cellWidth: 25, halign: "left" },
          2: { cellWidth: 75, halign: "left" },
          3: { cellWidth: 15 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 },
        },
        margin: { left: 15, right: 15 },
        didDrawPage: (data) => {
          const finalY = data.cursor.y + 8;
          doc.setFont("helvetica", "bold");
          doc.text(
            `Total Amount: ${bill.totalPrice.toFixed(2)}`,
            pageWidth - 20,
            finalY,
            { align: "right" }
          );
          doc.text(`Total PV: ${bill.totalPV}`, pageWidth - 20, finalY + 6, {
            align: "right",
          });
        },
        pageBreak: "auto",
        tableWidth: "auto",
        rowPageBreak: "auto",
      });
      doc.setDrawColor(200);
      doc.line(15, halfHeight, pageWidth - 15, halfHeight);
    };

    drawInvoice(0);
    drawInvoice(halfHeight);

    const pdfBlob = doc.output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl, "_blank");
  };

  // -------------------- Excel --------------------
  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      (bills || []).map((bill) => ({
        "Trans. Date": new Date(bill.createdAt).toLocaleString(),
        "Bill Number": bill.billNumber,
        "Member ID": bill.memberId,
        "Member Name": bill.memberName,
        Type: bill.purchaseType,
        PV: bill.totalPV,
        "Total Sales": bill.totalPrice,
        "Bill Status": bill.billStatus,
        "Branch Code": bill.branchCode,
        "Record By": bill.recordBy,
        "Cancel By": bill.cancelBy || "-",
        "Canceled Date": bill.canceledDate
          ? new Date(bill.canceledDate).toLocaleString()
          : "-",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "All Sale Bills");
    XLSX.writeFile(wb, "AllSaleBills.xlsx");
  };

  const handleExportExcelDetail = () => {
    const detailRows = [];
    (bills || []).forEach((bill) => {
      if (bill.billStatus === "Canceled") return; // ไม่รวมบิลที่ถูกยกเลิก
      (bill.items || []).forEach((item) => {
        detailRows.push({
          "Trans. Date": new Date(bill.createdAt).toLocaleString(),
          "Bill Number": bill.billNumber,
          "Member ID": bill.memberId,
          "Member Name": bill.memberName,
          "Product Code": item.productCode,
          "Product Name": item.productName,
          Qty: item.amount,
          Type: bill.purchaseType,
          PV: (item.pv || 0) * (item.amount || 0),
          "Total Price": (item.unitPrice || 0) * (item.amount || 0),
          "Bill Status": bill.billStatus,
          "Branch Code": bill.branchCode,
          "Record By": bill.recordBy,
          "Cancel By": bill.cancelBy || "-",
          "Canceled Date": bill.canceledDate
            ? new Date(bill.canceledDate).toLocaleString()
            : "-",
        });
      });
    });
    const ws = XLSX.utils.json_to_sheet(detailRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sale Bill Details");
    XLSX.writeFile(wb, "SaleBillDetails.xlsx");
  };

  // -------------------- Summary Data --------------------
  const summaryArray = useMemo(() => {
    const filteredBills = (bills || []).filter(
      (b) => b.billStatus !== "Canceled" && b.branchCode === selectedBranch
    );
    const summary = filteredBills.reduce((acc, bill) => {
      (bill.items || []).forEach((item) => {
        if (!acc[item.productCode])
          acc[item.productCode] = {
            productCode: item.productCode,
            productName: item.productName,
            totalQty: 0,
            totalPrice: 0,
          };
        acc[item.productCode].totalQty += item.amount || 0;
        acc[item.productCode].totalPrice +=
          (item.unitPrice || 0) * (item.amount || 0);
      });
      return acc;
    }, {});
    return Object.values(summary);
  }, [bills, selectedBranch]);

  const handleExportSummaryDaily = () => {
    const ws = XLSX.utils.json_to_sheet(
      summaryArray.map((row) => ({
        "Product Code": row.productCode,
        "Product Name": row.productName,
        "Total Qty": row.totalQty,
        "Total Price": row.totalPrice,
        "Branch Code": selectedBranch,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `SaleSummary_${selectedBranch}`);
    XLSX.writeFile(wb, `SaleSummary_${selectedBranch}.xlsx`);
  };

  // -------------------- Cancel --------------------
  const handleCancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this bill?")) {
      try {
        setCancelingId(id);
        setLocalLoading(true);
        await onCancel(id);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to cancel bill");
      } finally {
        setLocalLoading(false);
        setCancelingId(null);
      }
    }
  };

  // -------------------- Branch List --------------------
  const branchList = useMemo(() => {
    const list = Array.from(new Set(bills.map((b) => b.branchCode))).sort();
    return list;
  }, [bills]);

  // กำหนดค่าเริ่มต้น branch
  useEffect(() => {
    if (branchList.length > 0) {
      if (user?.role === "Admin") {
        setSelectedBranch(user?.branchCode || branchList[0]); // Admin ใช้ branch ตัวเองหรือ default เป็นตัวแรก
      } else {
        // Cashier ใช้ branch ของตัวเองเท่านั้น
        setSelectedBranch(user?.branchCode || branchList[0]);
      }
    }
  }, [branchList, user]);

  // -------------------- Render --------------------
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {error && (
        <Notification
          message={error}
          type="error"
          onClose={() => setError("")}
        />
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-300 mb-6">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "all"
              ? "border-b-2 border-orange-500 text-orange-600"
              : "text-gray-500 hover:bg-orange-50 rounded cursor-pointer"
          }`}
        >
          All Bills
        </button>
        <button
          onClick={() => setActiveTab("summary")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "summary"
              ? "border-b-2 border-orange-500 text-orange-600"
              : "text-gray-500 hover:bg-orange-50 rounded cursor-pointer"
          }`}
        >
          Sale Summary Daily
        </button>
      </div>

      {/* Tab: All Bills */}
      {activeTab === "all" && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              All Sale Bills Report
            </h2>
            <div className="flex space-x-3">
              <button
                onClick={handleExportExcel}
                disabled={!hasBills}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
              >
                Export to Excel
              </button>
              <button
                onClick={handleExportExcelDetail}
                disabled={!hasBills}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
              >
                Export to Excel Detail
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Bill Number",
                    "Trans. Date",
                    "Member ID",
                    "Member Name",
                    "Type",
                    "PV",
                    "Total Sales",
                    "Bill Status",
                    "Branch Code",
                    "Record By",
                    "Cancel By",
                    "Canceled Date",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-2 py-2 text-left text-xs bg-orange-50 font-medium text-gray-500 tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={13} className="px-4 py-8 text-center">
                      <div className="p-8 flex justify-center items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                      </div>
                      <span className="text-gray-600">
                        Loading bills data...
                      </span>
                    </td>
                  </tr>
                ) : !hasBills ? (
                  <tr>
                    <td colSpan={13} className="px-4 py-12 text-center">
                      No bills found
                    </td>
                  </tr>
                ) : (
                  currentBills.map((bill, index) => (
                    <tr
                      key={bill._id || index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-3 py-2 text-xs font-medium text-gray-900">
                        {bill.billNumber}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">
                        {new Date(bill.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">
                        {bill.memberId || "-"}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">
                        {bill.memberName || "-"}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">
                        {bill.purchaseType}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">
                        {bill.totalPV}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">
                        {bill.totalPrice.toFixed(2)}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            bill.billStatus === "Canceled"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {bill.billStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">
                        {bill.branchCode}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">
                        {bill.recordBy}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">
                        {bill.cancelBy || "-"}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">
                        {bill.canceledDate
                          ? new Date(bill.canceledDate).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-3 py-2 text-xs font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewPDF(bill)}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs font-medium"
                          >
                            View PDF
                          </button>
                          {user?.role === "Admin" &&
                            bill.billStatus !== "Canceled" && (
                              <button
                                onClick={() => handleCancel(bill._id)}
                                disabled={
                                  localLoading && cancelingId === bill._id
                                }
                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                              >
                                {localLoading && cancelingId === bill._id
                                  ? "Canceling..."
                                  : "Cancel"}
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {hasBills && totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-gray-300 text-sm cursor-pointer hover:text-orange-500 font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &lt;
              </button>

              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    currentPage === page
                      ? "bg-orange-500 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer hover:text-orange-500"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-gray-300 text-sm font-medium cursor-pointer hover:text-orange-500 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &gt;
              </button>

              <span className="text-sm text-gray-600 ml-2">
                Page {currentPage} of {totalPages} ({bills.length} records)
              </span>
            </div>
          )}
        </>
      )}

      {/* Tab: Sale Summary Daily */}
      {activeTab === "summary" && (
        <>
          <div className="flex justify-between items-center mb-4 gap-2">
            <div className="flex gap-2">
              {user?.role === "Admin" ? (
                <>
                  <label className="block font-medium text-gray-500">
                    Branch :
                  </label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="border px-3 py-1 w-36 rounded border-gray-300 cursor-pointer text-gray-600 text-sm"
                  >
                    {branchList.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <input
                  type="text"
                  value={selectedBranch}
                  readOnly
                  className="border px-3 py-1 rounded text-sm bg-gray-100"
                />
              )}
            </div>

            <button
              onClick={handleExportSummaryDaily}
              disabled={!hasBills}
              className="bg-blue-600 text-white px-4 py-2 cursor-pointer rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
            >
              Export Sale Daily
            </button>
          </div>

          {(() => {
            const grouped = {};
            summaryArray.forEach((row) => {
              if (!grouped[row.branchCode]) grouped[row.branchCode] = [];
              grouped[row.branchCode].push(row);
            });

            return Object.entries(grouped).map(([branchCode, rows]) => (
              <div key={branchCode} className="mb-8">
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {[
                          "Product Code",
                          "Product Name",
                          "Total Qty",
                          "Total Price",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-2 py-2 text-left text-xs bg-orange-50 font-medium text-gray-500"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {localLoading ? (
                        <tr>
                          <td colSpan={13} className="px-4 py-8 text-center">
                            <div className="p-8 flex justify-center items-center">
                              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            </div>
                            <span className="text-gray-600">
                              Loading bills data...
                            </span>
                          </td>
                        </tr>
                      ) : summaryArray.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center">
                            No data found for this branch
                          </td>
                        </tr>
                      ) : (
                        summaryArray.map((row, idx) => (
                          <tr
                            key={idx}
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="px-3 py-2 text-xs text-gray-600">
                              {row.productCode}
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-600">
                              {row.productName}
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-600">
                              {row.totalQty}
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-600">
                              {row.totalPrice.toFixed(2)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ));
          })()}
        </>
      )}
    </div>
  );
};

export default AllSaleBillReport;
