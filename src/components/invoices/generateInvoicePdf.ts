import type { Invoice } from "@/contexts/AppContext";
import { toast } from "sonner";

export function generateInvoicePdf(invoice: Invoice) {
  const html = `<html><head><style>
    body{font-family:system-ui,sans-serif;padding:40px;color:#333;max-width:700px;margin:0 auto}
    h1{font-size:24px;margin-bottom:4px}
    .meta{color:#666;font-size:14px;margin-bottom:24px}
    table{width:100%;border-collapse:collapse;margin-top:16px}
    th,td{border:1px solid #e5e5e5;padding:10px;text-align:left;font-size:14px}
    th{background:#fafafa;font-weight:600}
    .total{font-size:18px;font-weight:bold;text-align:right;margin-top:16px}
  </style></head><body>
    <h1>${invoice.number}</h1>
    <div class="meta">
      <p>Client: <strong>${invoice.clientName}</strong></p>
      <p>Date: ${invoice.date} · Due: ${invoice.dueDate}</p>
    </div>
    <table>
      <thead><tr><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
      <tbody>
        ${invoice.items.map(item => `<tr><td>${item.description}</td><td>${item.quantity}</td><td>$${item.price.toLocaleString()}</td><td>$${(item.quantity * item.price).toLocaleString()}</td></tr>`).join("")}
      </tbody>
    </table>
    <div class="total">Total: $${invoice.amount.toLocaleString()}</div>
  </body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${invoice.number}.html`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`Downloaded ${invoice.number}`);
}
