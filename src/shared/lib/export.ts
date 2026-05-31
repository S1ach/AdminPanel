import { formatCurrency } from './format-currency';

export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

export interface InvoiceOrder {
  id: number;
  client: string;
  clientEmail: string;
  amount: number;
  date: string;
  items: InvoiceItem[];
  address: string;
}

/**
 * Creates a hidden iframe to generate and print a beautiful PDF invoice of the order
 */
export function printInvoice(order: InvoiceOrder, locale: 'ru' | 'en') {
  const isRu = locale === 'ru';
  const currencyLocale = isRu ? 'ru-RU' : 'en-US';

  // Localized strings
  const labels = {
    invoice: isRu ? 'СЧЁТ-ФАКТУРА (ИНВОЙС)' : 'INVOICE',
    number: isRu ? 'Номер заказа:' : 'Order Number:',
    date: isRu ? 'Дата:' : 'Date:',
    billTo: isRu ? 'Получатель:' : 'Bill To:',
    shipTo: isRu ? 'Адрес доставки:' : 'Shipping Address:',
    item: isRu ? 'Товар' : 'Item',
    price: isRu ? 'Цена' : 'Price',
    qty: isRu ? 'Кол-во' : 'Qty',
    total: isRu ? 'Всего' : 'Total',
    subtotal: isRu ? 'Сумма:' : 'Subtotal:',
    tax: isRu ? 'НДС (20%):' : 'VAT (20%):',
    grandTotal: isRu ? 'Итого к оплате:' : 'Grand Total:',
    thanks: isRu ? 'Спасибо за ваш заказ!' : 'Thank you for your business!',
    company: 'Develop Admin Panel Inc.',
    companyAddr: isRu
      ? 'ул. Ленина, д. 10, Москва, Россия'
      : '100 Main Street, Suite 400, New York, NY, USA',
  };

  const formattedDate = new Date(order.date).toLocaleDateString(currencyLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subtotalValue = order.amount / 1.2;
  const taxValue = order.amount - subtotalValue;

  const itemsRows = order.items
    .map(
      (item) => `
      <tr>
        <td>
          <div class="item-name">${item.name}</div>
        </td>
        <td class="text-right">${formatCurrency(item.price, currencyLocale)}</td>
        <td class="text-center">${item.quantity}</td>
        <td class="text-right">${formatCurrency(item.price * item.quantity, currencyLocale)}</td>
      </tr>
    `,
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice #${order.id}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1f2937;
            margin: 0;
            padding: 40px;
            font-size: 14px;
            line-height: 1.5;
            background-color: #fff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            border-bottom: 2px solid #f3f4f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo-container {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .logo-text {
            font-weight: 800;
            font-size: 18px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .invoice-title {
            text-align: right;
          }
          .invoice-title h1 {
            margin: 0;
            font-size: 24px;
            color: #4f46e5;
            font-weight: 800;
          }
          .meta-info {
            margin-top: 5px;
            font-size: 12px;
            color: #6b7280;
          }
          .bill-zone {
            display: flex;
            justify-content: space-between;
            margin-bottom: 35px;
            gap: 20px;
          }
          .bill-card {
            flex: 1;
          }
          .bill-card h3 {
            margin: 0 0 8px 0;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #9ca3af;
            font-weight: 700;
          }
          .bill-card p {
            margin: 0 0 4px 0;
            font-size: 13px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            background-color: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
            padding: 10px 12px;
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 700;
            color: #6b7280;
            text-align: left;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #f3f4f6;
            vertical-align: middle;
          }
          .item-name {
            font-weight: 600;
            color: #111827;
          }
          .text-right {
            text-align: right;
          }
          .text-center {
            text-align: center;
          }
          .summary-container {
            display: flex;
            justify-content: flex-end;
          }
          .summary-table {
            width: 320px;
            margin-bottom: 0;
          }
          .summary-table td {
            padding: 6px 12px;
            border: 0;
          }
          .summary-table tr.total-row td {
            border-top: 2px solid #e5e7eb;
            font-size: 16px;
            font-weight: 800;
            color: #111827;
            padding-top: 12px;
          }
          .footer {
            margin-top: 60px;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
            border-top: 1px solid #f3f4f6;
            padding-top: 20px;
          }
          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <div class="logo-container">
              <!-- Hexagon logo path from logo.svg -->
              <svg width="24" height="28" viewBox="0 0 786.66 910.83" style="fill: #4f46e5;">
                <path d="M618.39,799.4l-158.12,92.81c-41.72,24.49-89.3,24.92-130.92.63L62.1,736.88C28.29,717.15,3.08,685.5.06,645.26l-.06-377.73c2.63-39.83,26.28-74.76,61.47-92.86L332.13,16.37c34.1-19.94,79.97-22.6,114.73-2.79l275.08,156.72c30.04,17.12,53.96,42.77,61.62,77.44,1.62,7.32,3.1,14.91,3.09,22.97l-.42,372.06c-.04,35.98-21.09,71.15-51.76,89.01l-116.08,67.63ZM524.06,437.39l-182.99,117.87-161.59,105.3,118.09-211.82,94.35-168.97,18.15,32.72,60.68,109.48,53.1-35.39-57.21-105.81-74.54-136.73-115.92,211.54-80.34,146.45-98.52,177.88,182.47.08,67.36-55.75,166.13-137.55,66.23-54.86,118.58-100.55-174.01,106.1ZM685.17,679.9l-58.56-104.89-47.03-84.08-50.2,40.36,84.06,148.75,71.73-.14Z" />
              </svg>
              <span class="logo-text">${labels.company}</span>
            </div>
            <div class="meta-info" style="margin-top: 10px;">
              ${labels.companyAddr}
            </div>
          </div>
          <div class="invoice-title">
            <h1>${labels.invoice}</h1>
            <div class="meta-info">
              <div><strong>${labels.number}</strong> #${order.id}</div>
              <div><strong>${labels.date}</strong> ${formattedDate}</div>
            </div>
          </div>
        </div>

        <div class="bill-zone">
          <div class="bill-card">
            <h3>${labels.billTo}</h3>
            <p><strong>${order.client}</strong></p>
            <p style="color: #4b5563;">${order.clientEmail}</p>
          </div>
          <div class="bill-card">
            <h3>${labels.shipTo}</h3>
            <p>${order.address}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 50%;">${labels.item}</th>
              <th class="text-right" style="width: 20%;">${labels.price}</th>
              <th class="text-center" style="width: 10%;">${labels.qty}</th>
              <th class="text-right" style="width: 20%;">${labels.total}</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="summary-container">
          <table class="summary-table">
            <tr>
              <td class="text-zinc-500">${labels.subtotal}</td>
              <td class="text-right">${formatCurrency(subtotalValue, currencyLocale)}</td>
            </tr>
            <tr>
              <td class="text-zinc-500">${labels.tax}</td>
              <td class="text-right">${formatCurrency(taxValue, currencyLocale)}</td>
            </tr>
            <tr class="total-row">
              <td>${labels.grandTotal}</td>
              <td class="text-right">${formatCurrency(order.amount, currencyLocale)}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <p>${labels.thanks}</p>
        </div>
      </body>
    </html>
  `;

  // Create frame
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (doc) {
    doc.write(htmlContent);
    doc.close();
  }

  // Allow styles to load, then print and clean up
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    document.body.removeChild(iframe);
  }, 350);
}

/**
 * Formats and downloads data as a premium Microsoft Excel-compliant XML spreadsheet (SpreadsheetML)
 */
export function generateXLS(
  data: Record<string, string | number>[],
  columns: { key: string; label: string; type: 'String' | 'Number' }[],
  filename: string,
  sheetName: string,
) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#4F46E5" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    </Style>
    <Style ss:ID="Default">
      <Alignment ss:Vertical="Center"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="${sheetName}">
    <Table>
      <Row ss:Height="22">`;

  // Columns headers
  columns.forEach((col) => {
    xml += `
        <Cell ss:StyleID="Header"><Data ss:Type="String">${col.label}</Data></Cell>`;
  });

  xml += `
      </Row>`;

  // Rows data
  data.forEach((row) => {
    xml += `
      <Row ss:Height="18">`;
    columns.forEach((col) => {
      const val = row[col.key];
      const safeVal = val !== undefined && val !== null ? String(val) : '';
      const type = col.type;

      xml += `
        <Cell ss:StyleID="Default"><Data ss:Type="${type}">${safeVal}</Data></Cell>`;
    });
    xml += `
      </Row>`;
  });

  xml += `
    </Table>
  </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
