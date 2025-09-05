import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import NotoSans from "../fonts/NotoSans"; // นำเข้าไฟล์ฟอนต์

export const generateInvoicePDF = (bill, user) => {
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
