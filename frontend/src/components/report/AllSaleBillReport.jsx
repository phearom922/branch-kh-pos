import { useState, useContext } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Notification from "../common/Notification";
import { AuthContext } from "../../context/AuthContext";
import NotoSans from "../../fonts/NotoSans"; // นำเข้าไฟล์ฟอนต์

const AllSaleBillReport = ({ bills, onCancel }) => {
  const { user } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

        // จำกัดตารางให้อยู่ครึ่งเดียว ถ้ามากเกินจะไปหน้าใหม่
        pageBreak: "auto",
        tableWidth: "auto",
        rowPageBreak: "auto",
      });

      // // ===== Copy mark =====
      // doc.setFontSize(8);
      // doc.setFont("helvetica", "italic");
      // doc.text(
      //   isCopy ? "(Office Copy)" : "(Customer Copy)",
      //   pageWidth - 20,
      //   yStart + 10,
      //   {
      //     align: "right",
      //   }
      // );

      // // ===== Divider line (กลางหน้า) =====
      // if (!isCopy) {
      //   doc.setDrawColor(200);
      //   doc.line(15, halfHeight, pageWidth - 15, halfHeight);
      // }

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
        setLoading(true);
        await onCancel(id);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError(err.response?.data?.message || "Failed to cancel bill");
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {error && <Notification message={error} type="error" />}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          All Sale Bills Report
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={handleExportExcel}
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors text-sm font-medium"
          >
            Export to Excel
          </button>
          <button
            onClick={handleExportExcelDetail}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Export to Excel Detail
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        {/* ตารางแสดงข้อมูล */}
        <table className="w-full text-[11.5px] font-semibold rounded ring-1 ring-gray-200 overflow-hidden">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-2 text-left font-medium text-[12px]">
                Bill Number
              </th>
              <th className="p-2 text-left font-medium text-[12px]">
                Trans. Date
              </th>
              <th className="p-2 text-left font-medium text-[12px]">
                Member ID
              </th>
              <th className="p-2 text-left font-medium text-[12px]">
                Member Name
              </th>
              <th className="p-2 text-left font-medium text-[12px]">Type</th>
              <th className="p-2 text-left font-medium text-[12px]">PV</th>
              <th className="p-2 text-left font-medium text-[12px]">
                Total Sales
              </th>
              <th className="p-2 text-left font-medium text-[12px]">
                Bill Status
              </th>
              <th className="p-2 text-left font-medium text-[12px]">
                Branch Code
              </th>
              <th className="p-2 text-left font-medium text-[12px]">
                Record By
              </th>
              <th className="p-2 text-left font-medium text-[12px]">
                Cancel By
              </th>
              <th className="p-2 text-left font-medium text-[12px]">
                Canceled Date
              </th>
              <th className="p-2 text-left font-medium text-[12px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="100%" className="text-center p-8">
                  <div className="flex justify-center items-center">
                    <svg
                      className="animate-spin h-6 w-6 text-orange-500 mr-2"
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    <span className="text-orange-500 font-medium">
                      Loading...
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              bills.map((bill, index) => (
                <tr
                  key={bill._id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="p-3 text-gray-600">
                    {new Date(bill.createdAt).toLocaleString()}
                  </td>
                  <td className="p-2 text-gray-600">{bill.billNumber}</td>
                  <td className="p-2 text-gray-600">{bill.memberId}</td>
                  <td className="p-2 text-gray-600">{bill.memberName}</td>
                  <td className="p-2 text-gray-600">{bill.purchaseType}</td>
                  <td className="p-2 text-gray-600">{bill.totalPV}</td>
                  <td className="p-2 text-gray-600">
                    {bill.totalPrice.toFixed(2)}
                  </td>
                  <td className="p-2">
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
                  <td className="p-2 text-gray-600">{bill.branchCode}</td>
                  <td className="p-2 text-gray-600">{bill.recordBy}</td>
                  <td className="p-2 text-gray-600">{bill.cancelBy || "-"}</td>
                  <td className="p-2 text-gray-600">
                    {bill.canceledDate
                      ? new Date(bill.canceledDate).toLocaleString()
                      : "-"}
                  </td>
                  <td className="p-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewPDF(bill)}
                        className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-400 text-xs font-medium transition-colors"
                      >
                        View PDF
                      </button>
                      {user.role === "Admin" &&
                        bill.billStatus !== "Canceled" && (
                          <button
                            onClick={() => handleCancel(bill._id)}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-xs font-medium transition-colors"
                          >
                            Cancel
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

      {bills.length === 0 && (
        <div className="text-center py-8 text-gray-500">No bills found</div>
      )}
    </div>
  );
};

export default AllSaleBillReport;
