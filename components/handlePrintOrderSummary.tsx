import { DETAILS } from "@/public/details";
import { OrderResponse } from "@/types";

export const handlePrintOrderSummaryFn = (
  orderData: OrderResponse,
  defaultCompanyInfo = DETAILS.COMPANY_INFO
) => {
  // Validate input
  if (
    !orderData ||
    !orderData.productDetails ||
    orderData.productDetails.length === 0
  ) {
    alert("No order data to print.");
    return;
  }

  const printDate = new Date().toLocaleDateString();
  const printTime = new Date().toLocaleTimeString();
  const orderDate = new Date(orderData.createdAt).toLocaleDateString();
  const orderTime = new Date(orderData.createdAt).toLocaleTimeString();

  // Calculate totals
  const subtotal = orderData.productDetails.reduce(
    (sum, item) => sum + item.amount * item.quantity,
    0
  );
  const totalDiscount = orderData.productDetails.reduce((sum, item) => {
    const itemTotal = item.amount * item.quantity;
    const discountAmount = (itemTotal * item.discountPercent) / 100;
    return sum + discountAmount;
  }, 0);
  const finalTotal = subtotal - totalDiscount;

  // Payment mode mapping
  const getPaymentModeText = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "upi":
        return "UPI";
      case "cash":
        return "Cash";
      case "credit":
        return "Credit";
      default:
        return mode;
    }
  };

  // Order mode mapping
  const getOrderModeText = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "offline":
        return "Offline";
      case "online":
        return "Online";
      default:
        return mode;
    }
  };

  const orderHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Summary - ${orderData.orderNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            background: white;
          }
          
          .order-container {
            max-width: 800px;
            margin: 20px auto;
            padding: 30px;
            border: 1px solid #ddd;
            background: white;
          }
          
          .order-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #2c3e50;
          }
          
          .company-info h1 {
            font-size: 24px;
            color: #2c3e50;
            margin-bottom: 5px;
            font-weight: bold;
          }
          
          .company-info p {
            margin: 2px 0;
            color: #666;
          }
          
          .order-details {
            text-align: right;
          }
          
          .order-details h2 {
            font-size: 28px;
            color: #e74c3c;
            margin-bottom: 10px;
          }
          
          .status-badge {
            display: inline-block;
            background: #f39c12;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 5px;
          }
          
          .status-badge.pending {
            background: #f39c12;
          }
          
          .status-badge.confirmed {
            background: #27ae60;
          }
          
          .status-badge.delivered {
            background: #2ecc71;
          }
          
          .status-badge.cancelled {
            background: #e74c3c;
          }
          
          .order-meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }
          
          .customer-info, .order-info {
            padding: 15px;
            background: #f8f9fa;
            border-left: 4px solid #3498db;
          }
          
          .customer-info h3, .order-info h3 {
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 14px;
          }
          
          .address-info {
            grid-column: 1 / -1;
            padding: 15px;
            background: #e8f6f3;
            border-left: 4px solid #27ae60;
            margin-top: 15px;
          }
          
          .address-info h3 {
            color: #27ae60;
            margin-bottom: 8px;
            font-size: 14px;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          .items-table th {
            background: #34495e;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
          }
          
          .items-table td {
            padding: 10px 8px;
            border-bottom: 1px solid #eee;
          }
          
          .items-table tbody tr:hover {
            background: #f8f9fa;
          }
          
          .items-table tbody tr:nth-child(even) {
            background: #fafafa;
          }
          
          .text-right {
            text-align: right;
          }
          
          .text-center {
            text-align: center;
          }
          
          .totals-section {
            float: right;
            width: 300px;
            margin-top: 20px;
          }
          
          .totals-table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .totals-table td {
            padding: 8px 12px;
            border-bottom: 1px solid #eee;
          }
          
          .totals-table .total-row {
            background: #2c3e50;
            color: white;
            font-weight: bold;
            font-size: 14px;
          }
          
          .subtotal-row {
            background: #ecf0f1;
          }
          
          .discount-row {
            color: #e74c3c;
          }
          
          .footer {
            clear: both;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 11px;
          }
          
          .thank-you {
            margin-top: 30px;
            text-align: center;
            font-size: 16px;
            color: #27ae60;
            font-weight: bold;
          }
          
          .color-badge {
            display: inline-block;
            background: #e9ecef;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10px;
            margin-left: 5px;
            color: #495057;
          }
          
          .size-badge {
            display: inline-block;
            background: #dee2e6;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10px;
            margin-left: 5px;
            color: #495057;
          }
          
          @media print {
            body { margin: 0; }
            .order-container { 
              margin: 0; 
              border: none; 
              box-shadow: none;
              max-width: none;
            }
            .items-table { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="order-container">
          <!-- Header -->
          <div class="order-header">
            <div class="company-info">
              <h1>${defaultCompanyInfo.name}</h1>
              <p>${defaultCompanyInfo.address}</p>
              <p>${defaultCompanyInfo.city}</p>
              <p>Phone: ${defaultCompanyInfo.phone}</p>
              <p>Email: ${defaultCompanyInfo.email}</p>
              <p>Tax ID: ${defaultCompanyInfo.taxId}</p>
            </div>
            <div class="order-details">
              <h2>ORDER SUMMARY</h2>
              <p><strong>Order #:</strong> ${orderData.orderNumber}</p>
              <div class="status-badge ${orderData.status.toLowerCase()}">${
    orderData.status
  }</div>
            </div>
          </div>
          
          <!-- Order Meta Information -->
          <div class="order-meta">
            <div class="customer-info">
              <h3>Customer Details:</h3>
              <p><strong>${orderData.name}</strong></p>
              <p>Phone: ${orderData.phoneNumber}</p>
              <p>Mode: ${getOrderModeText(orderData.mode)}</p>
              <p>Payment: ${getPaymentModeText(orderData.paymentMode)}</p>
            </div>
            <div class="order-info">
              <h3>Order Information:</h3>
              <p><strong>Order Date:</strong> ${orderDate}</p>
              <p><strong>Order Time:</strong> ${orderTime}</p>
              <p><strong>Total Items:</strong> ${orderData.productDetails.reduce(
                (sum, item) => sum + item.quantity,
                0
              )}</p>
              <p><strong>Status:</strong> ${orderData.status.toUpperCase()}</p>
            </div>
            
            <div class="address-info">
              <h3>Delivery Address:</h3>
              <p>${orderData.address}</p>
            </div>
          </div>
          
          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 8%">#</th>
                <th style="width: 15%">Article No.</th>
                <th style="width: 35%">Description</th>
                <th style="width: 10%" class="text-center">Qty</th>
                <th style="width: 12%" class="text-right">Unit Price</th>
                <th style="width: 10%" class="text-center">Disc%</th>
                <th style="width: 10%" class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderData.productDetails
                .map((item, index) => {
                  const itemSubtotal = item.amount * item.quantity;
                  const discountAmount =
                    (itemSubtotal * item.discountPercent) / 100;
                  const itemTotal = itemSubtotal - discountAmount;

                  return `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${
                      typeof item.productId === "object"
                        ? item.productId.articleNo
                        : "N/A"
                    }</td>
                    <td>
                      <strong>${
                        typeof item.productId === "object" ? item.productId.name : "Unknown Product"
                      }</strong>
                      ${item.color ? `<span class="color-badge">${item.color}</span>` : ""}
                      ${item.size ? `<span class="size-badge">Size: ${item.size}</span>` : ""}
                    </td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">₹${item.amount.toFixed(2)}</td>
                    <td class="text-center">${item.discountPercent}%</td>
                    <td class="text-right"><strong>₹${itemTotal.toFixed(
                      2
                    )}</strong></td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
          
          <!-- Totals Section -->
          <div class="totals-section">
            <table class="totals-table">
              <tr class="subtotal-row">
                <td><strong>Subtotal:</strong></td>
                <td class="text-right"><strong>₹${subtotal.toFixed(
                  2
                )}</strong></td>
              </tr>
              ${
                totalDiscount > 0
                  ? `
                <tr class="discount-row">
                  <td><strong>Total Discount:</strong></td>
                  <td class="text-right"><strong>-₹${totalDiscount.toFixed(
                    2
                  )}</strong></td>
                </tr>
              `
                  : ""
              }
              <tr class="total-row">
                <td><strong>TOTAL:</strong></td>
                <td class="text-right"><strong>₹${finalTotal.toFixed(
                  2
                )}</strong></td>
              </tr>
            </table>
          </div>
          
          <!-- Thank You Message -->
          <div class="thank-you">
            Thank you for your order, ${orderData.name}!
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p>This is a computer generated order summary. No signature required.</p>
            <p>For any queries, please contact us at ${
              defaultCompanyInfo.phone
            } or ${defaultCompanyInfo.email}</p>
            <p style="margin-top: 10px; font-size: 10px;">
              Order placed on ${orderDate} at ${orderTime} | Order #${
    orderData.orderNumber
  } | Status: ${orderData.status.toUpperCase()}
            </p>
            <p style="margin-top: 5px; font-size: 10px;">
              Printed on ${printDate} at ${printTime}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

  // Open print window
  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (printWindow) {
    printWindow.document.write(orderHTML);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };
  } else {
    alert("Please allow popup windows to print the order summary.");
  }
};
