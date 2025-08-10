import { DETAILS } from "@/public/details";
import { BillItem } from "@/types";

export const handlePrintBill = (billItems: BillItem[], defaultCompanyInfo = DETAILS.COMPANY_INFO) => {

  const billDate = new Date().toLocaleDateString();
  const billTime = new Date().toLocaleTimeString();
  const billNumber = `INV-${Date.now()}`;

  const subtotal = billItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalDiscount = billItems.reduce((sum, item) => sum + ((item.product.price * item.quantity) * (item.discount / 100)), 0);
  const finalTotal = billItems.reduce((sum, item) => sum + item.finalPrice, 0);

  const billHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice - ${billNumber}</title>
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
          
          .invoice-container {
            max-width: 800px;
            margin: 20px auto;
            padding: 30px;
            border: 1px solid #ddd;
            background: white;
          }
          
          .invoice-header {
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
          
          .invoice-details {
            text-align: right;
          }
          
          .invoice-details h2 {
            font-size: 28px;
            color: #e74c3c;
            margin-bottom: 10px;
          }
          
          .invoice-meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }
          
          .bill-info, .date-info {
            padding: 15px;
            background: #f8f9fa;
            border-left: 4px solid #3498db;
          }
          
          .bill-info h3, .date-info h3 {
            color: #2c3e50;
            margin-bottom: 10px;
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
          
          @media print {
            body { margin: 0; }
            .invoice-container { 
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
        <div class="invoice-container">
          <!-- Header -->
          <div class="invoice-header">
            <div class="company-info">
              <h1>${defaultCompanyInfo.name}</h1>
              <p>${defaultCompanyInfo.address}</p>
              <p>${defaultCompanyInfo.city}</p>
              <p>Phone: ${defaultCompanyInfo.phone}</p>
              <p>Email: ${defaultCompanyInfo.email}</p>
              <p>Tax ID: ${defaultCompanyInfo.taxId}</p>
            </div>
            <div class="invoice-details">
              <h2>INVOICE</h2>
              <p><strong>Invoice #:</strong> ${billNumber}</p>
            </div>
          </div>
          
          <!-- Invoice Meta Information -->
          <div class="invoice-meta">
            <div class="bill-info">
              <h3>Bill To:</h3>
              <p><strong>Customer</strong></p>
              <p>Walk-in Customer</p>
            </div>
            <div class="date-info">
              <h3>Invoice Details:</h3>
              <p><strong>Date:</strong> ${billDate}</p>
              <p><strong>Time:</strong> ${billTime}</p>
              <p><strong>Items:</strong> ${billItems.length}</p>
            </div>
          </div>
          
          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 10%">#</th>
                <th style="width: 15%">Article No.</th>
                <th style="width: 35%">Description</th>
                <th style="width: 10%" class="text-center">Qty</th>
                <th style="width: 12%" class="text-right">Unit Price</th>
                <th style="width: 8%" class="text-center">Disc%</th>
                <th style="width: 10%" class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${billItems.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.product.articleNo}</td>
                  <td><strong>${item.product.name}</strong></td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">₹${item.product.price.toFixed(2)}</td>
                  <td class="text-center">${item.discount}%</td>
                  <td class="text-right"><strong>₹${item.finalPrice.toFixed(2)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <!-- Totals Section -->
          <div class="totals-section">
            <table class="totals-table">
              <tr class="subtotal-row">
                <td><strong>Subtotal:</strong></td>
                <td class="text-right"><strong>₹${subtotal.toFixed(2)}</strong></td>
              </tr>
              <tr class="discount-row">
                <td><strong>Total Discount:</strong></td>
                <td class="text-right"><strong>-₹${totalDiscount.toFixed(2)}</strong></td>
              </tr>
              <tr class="total-row">
                <td><strong>TOTAL:</strong></td>
                <td class="text-right"><strong>₹${finalTotal.toFixed(2)}</strong></td>
              </tr>
            </table>
          </div>
          
          <!-- Thank You Message -->
          <div class="thank-you">
            Thank you for your business!
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p>This is a computer generated invoice. No signature required.</p>
            <p>For any queries, please contact us at ${defaultCompanyInfo.phone} or ${defaultCompanyInfo.email}</p>
          </div>
        </div>
      </body>
      </html>
    `;

  // Open print window
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.write(billHTML);
    printWindow.document.close();

    // Wait for content to load before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };
  } else {
    alert('Please allow popup windows to print the bill.');
  }
};