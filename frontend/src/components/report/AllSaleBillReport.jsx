import { useState, useContext } from "react";
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

  const handleViewPDF = (bill) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // เพิ่มฟอนต์ NotoSans
    doc.addFileToVFS("NotoSans.ttf", NotoSans.font);
    doc.addFont("NotoSans.ttf", "NotoSans", "normal");

    const pageWidth = doc.internal.pageSize.getWidth();
    const halfHeight = doc.internal.pageSize.getHeight() / 2;

    const drawInvoice = (yStart, isCopy = false) => {
      // ===== Title =====
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("INVOICE", pageWidth / 2, yStart + 10, { align: "center" });

      // ===== Branch Info =====
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(user.branchName || "Unknown Branch", 15, yStart + 20);
      doc.setFont("helvetica", "normal");
      doc.text(user.address || "Unknown Address", 15, yStart + 26);

      // ===== Bill Info =====
      let y = yStart + 35;
      doc.setFontSize(10);
      doc.text(`Bill No: ${bill.billNumber}`, 15, y);
      doc.text(
        `Invoice Date: ${new Date(bill.createdAt).toLocaleString()}`,
        120,
        y
      );
      y += 5;
      doc.setFont("NotoSans", "normal");
      doc.text(`Member Name: ${bill.memberName || "-"}`, 15, y);
      doc.text(`Member ID: ${bill.memberId || "-"}`, 120, y);
      y += 5;
      doc.text(`Type: ${bill.purchaseType || "N/A"}`, 15, y);
      doc.text(`Recorded By: ${bill.recordBy || "N/A"}`, 120, y);

      // Table
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
          // Summary
          const finalY = data.cursor.y + 8;
          doc.setFont("helvetica", "bold");

          // Total Amount
          doc.text(
            `Total Amount: ${bill.totalPrice.toFixed(2)}`,
            pageWidth - 20,
            finalY,
            { align: "right" }
          );

          // Total PV (เลื่อนลงมา 6 mm)
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

    // บนครึ่ง (ลูกค้า)
    drawInvoice(0, false);
    drawInvoice(halfHeight, true);

    // ===== Export PDF =====
    const pdfBlob = doc.output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl, "_blank");
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      bills.map((bill) => ({
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

    bills.forEach((bill) => {
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

  // ตรวจสอบสถานะการโหลดทั้งหมด
  const isGlobalLoading = isLoading;
  const hasBills = bills && bills.length > 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {error && (
        <Notification
          message={error}
          type="error"
          onClose={() => setError("")}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          All Sale Bills Report
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={handleExportExcel}
            disabled={!hasBills}
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium flex items-center"
          >
            {isGlobalLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading...
              </>
            ) : (
              "Export to Excel"
            )}
          </button>
          <button
            onClick={handleExportExcelDetail}
            disabled={!hasBills}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
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
            {isGlobalLoading ? (
              // สถานะกำลังโหลดข้อมูล
              <tr>
                <td colSpan={13} className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="animate-spin h-8 w-8 text-orange-500 mb-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <p className="text-gray-600 font-medium">
                      Loading bills data...
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Please wait while we fetch your records
                    </p>
                  </div>
                </td>
              </tr>
            ) : !hasBills ? (
              // สถานะไม่มีข้อมูล
              <tr>
                <td colSpan={13} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="h-12 w-12 text-gray-400 mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-gray-500 text-lg font-medium">
                      No bills found
                    </p>
                    <p className="text-gray-400 mt-1">
                      There are no sale bills to display at the moment.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              // แสดงข้อมูล bills
              bills.map((bill, index) => (
                <tr
                  key={bill._id || index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-medium">
                    {bill.billNumber}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                    {new Date(bill.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                    {bill.memberId || "-"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                    {bill.memberName || "-"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                    {bill.purchaseType}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                    {bill.totalPV}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                    {bill.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
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
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                    {bill.branchCode}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                    {bill.recordBy}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                    {bill.cancelBy || "-"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                    {bill.canceledDate
                      ? new Date(bill.canceledDate).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewPDF(bill)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs font-medium transition-colors"
                      >
                        View PDF
                      </button>
                      {user.role === "Admin" &&
                        bill.billStatus !== "Canceled" && (
                          <button
                            onClick={() => handleCancel(bill._id)}
                            disabled={localLoading && cancelingId === bill._id}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition-colors flex items-center"
                          >
                            {localLoading && cancelingId === bill._id ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Canceling...
                              </>
                            ) : (
                              "Cancel"
                            )}
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
    </div>
  );
};

export default AllSaleBillReport;
