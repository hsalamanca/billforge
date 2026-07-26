"use client";

import { jsPDF } from "jspdf";
import type { BillDocument } from "./types";
import { documentTotals, formatMoney, lineTotal } from "./currency";

export function downloadDocumentPdf(doc: BillDocument, opts: { watermark: boolean }) {
  const pdf = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = pdf.internal.pageSize.getWidth();
  const margin = 48;
  let y = margin;

  const ink = "#12171C";
  const muted = "#5C6570";
  const brass = "#B8923A";
  const rule = "#D5DBE3";

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(ink);
  pdf.text(doc.from.name || "Your business", margin, y);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(muted);
  const fromLines = [doc.from.email, doc.from.phone, doc.from.address].filter(Boolean);
  fromLines.forEach((line, i) => {
    pdf.text(String(line), margin, y + 16 + i * 13);
  });

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(28);
  pdf.setTextColor(brass);
  const title = doc.type === "invoice" ? "INVOICE" : "QUOTE";
  pdf.text(title, pageW - margin, y, { align: "right" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(muted);
  pdf.text(`No. ${doc.number}`, pageW - margin, y + 22, { align: "right" });
  pdf.text(`Issued ${doc.issueDate}`, pageW - margin, y + 36, { align: "right" });
  pdf.text(
    doc.type === "invoice" ? `Due ${doc.dueDate}` : `Valid through ${doc.dueDate}`,
    pageW - margin,
    y + 50,
    { align: "right" },
  );

  y += 90;
  pdf.setDrawColor(rule);
  pdf.setLineWidth(1);
  pdf.line(margin, y, pageW - margin, y);
  y += 28;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(brass);
  pdf.text("BILL TO", margin, y);
  y += 16;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(ink);
  pdf.text(doc.to.name || "Client name", margin, y);
  y += 14;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(muted);
  [doc.to.email, doc.to.address].filter(Boolean).forEach((line) => {
    pdf.text(String(line), margin, y);
    y += 13;
  });

  y += 22;
  const cols = {
    desc: margin,
    qty: pageW - margin - 180,
    rate: pageW - margin - 110,
    amount: pageW - margin,
  };

  pdf.setFillColor(18, 23, 28);
  pdf.rect(margin, y - 12, pageW - margin * 2, 22, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor("#F3F5F7");
  pdf.text("DESCRIPTION", cols.desc + 8, y);
  pdf.text("QTY", cols.qty, y, { align: "right" });
  pdf.text("RATE", cols.rate, y, { align: "right" });
  pdf.text("AMOUNT", cols.amount, y, { align: "right" });
  y += 24;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(ink);

  doc.items.forEach((item, index) => {
    if (y > 680) {
      pdf.addPage();
      y = margin;
    }
    if (index % 2 === 0) {
      pdf.setFillColor(243, 245, 247);
      pdf.rect(margin, y - 11, pageW - margin * 2, 22, "F");
    }
    const desc = item.description || "—";
    pdf.text(desc.slice(0, 60), cols.desc + 8, y);
    pdf.text(String(item.quantity), cols.qty, y, { align: "right" });
    pdf.text(formatMoney(item.rate, doc.currency), cols.rate, y, { align: "right" });
    pdf.text(formatMoney(lineTotal(item.quantity, item.rate), doc.currency), cols.amount, y, {
      align: "right",
    });
    y += 22;
  });

  y += 16;
  const { subtotal, tax, total } = documentTotals(doc.items, doc.taxRate);
  const totalsX = pageW - margin;
  const labelX = pageW - margin - 130;

  const row = (label: string, value: string, bold = false) => {
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(bold ? 12 : 10);
    pdf.setTextColor(bold ? ink : muted);
    pdf.text(label, labelX, y, { align: "right" });
    pdf.setTextColor(ink);
    pdf.text(value, totalsX, y, { align: "right" });
    y += bold ? 20 : 16;
  };

  row("Subtotal", formatMoney(subtotal, doc.currency));
  if (doc.taxRate > 0) row(`Tax (${doc.taxRate}%)`, formatMoney(tax, doc.currency));
  row("Total", formatMoney(total, doc.currency), true);

  if (doc.notes) {
    y += 16;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(brass);
    pdf.text("NOTES", margin, y);
    y += 14;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(muted);
    const notes = pdf.splitTextToSize(doc.notes, pageW - margin * 2);
    pdf.text(notes, margin, y);
  }

  if (opts.watermark) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(48);
    pdf.setTextColor(200, 200, 205);
    pdf.text("BILLFORGE", pageW / 2, 420, { align: "center", angle: 28 });
    pdf.setFontSize(9);
    pdf.setTextColor(muted);
    pdf.text("Created with Billforge — upgrade to remove this mark", pageW / 2, 760, {
      align: "center",
    });
  }

  pdf.save(`${doc.number}.pdf`);
}
