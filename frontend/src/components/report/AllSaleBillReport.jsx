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

  const hasBills = Array.isArray(bills) && bills.length > 0;

  const handleViewPDF = (bill) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    // ฟอนต์ภาษาไทย
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
      doc.setFontSize(10);
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

    // สองสำเนาในหน้าเดียว
    drawInvoice(0);
    drawInvoice(halfHeight);

    const pdfBlob = doc.output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl, "_blank");
  };

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
            Export to Excel
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
            {isLoading ? (
              <tr>
                <td colSpan={13} className="px-4 py-8 text-center">
                  <div className="p-8 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                  Loading bills data...
                </td>
              </tr>
            ) : !hasBills ? (
              <tr>
                <td colSpan={13} className="px-4 py-12 text-center">
                  No bills found
                </td>
              </tr>
            ) : (
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
                      {user?.role === "Admin" &&
                        bill.billStatus !== "Canceled" && (
                          <button
                            onClick={() => handleCancel(bill._id)}
                            disabled={localLoading && cancelingId === bill._id}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition-colors"
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
    </div>
  );
};

export default AllSaleBillReport;