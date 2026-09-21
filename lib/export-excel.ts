import ExcelJS from 'exceljs';
import { SaleWithItems } from '@/components/historique/sales-list';

export async function exportSalesToExcel(sales: SaleWithItems[], periodLabel: string) {
  if (sales.length === 0) {
    alert('Aucune vente à exporter pour cette période.');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Maktaba POS';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Journal des Ventes', {
    views: [{ showGridLines: true }],
  });

  // Calculate high-level summary metrics
  const completedSales = sales.filter((s) => s.status !== 'cancelled');
  const totalRevenue = completedSales.reduce((acc, s) => acc + s.total_amount, 0);
  const totalProfit = completedSales.reduce((acc, s) => {
    return (
      acc +
      s.items.reduce((sum, i) => sum + (i.unit_sell_price - i.unit_buy_price) * i.quantity, 0) -
      s.discount_amount
    );
  }, 0);

  // ==========================================
  // 1. TOP TITLE BANNER (Indigo background)
  // ==========================================
  sheet.mergeCells('A1:K1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'MAKTABA POS — JOURNAL DÉTAILLÉ DES VENTES';
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF312E81' }, // Dark Indigo
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(1).height = 36;

  // Subtitle / Date block
  sheet.mergeCells('A2:K2');
  const subtitleCell = sheet.getCell('A2');
  subtitleCell.value = `Période : ${periodLabel.toUpperCase()}  |  Date d'export : ${new Intl.DateTimeFormat(
    'fr-FR',
    { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  ).format(new Date())}`;
  subtitleCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF4338CA' } };
  subtitleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFEEF2FF' }, // Soft Indigo
  };
  subtitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(2).height = 24;

  // ==========================================
  // 2. EXECUTIVE SUMMARY CARDS (Rows 4-5)
  // ==========================================
  // Chiffre d'Affaires Card
  sheet.mergeCells('B4:C4');
  sheet.getCell('B4').value = "CHIFFRE D'AFFAIRES";
  sheet.getCell('B4').font = { size: 9, bold: true, color: { argb: 'FF64748B' } };
  sheet.mergeCells('B5:C5');
  sheet.getCell('B5').value = `${totalRevenue.toFixed(2)} DH`;
  sheet.getCell('B5').font = { size: 14, bold: true, color: { argb: 'FF0F172A' } };

  // Bénéfice Net Card
  sheet.mergeCells('E4:F4');
  sheet.getCell('E4').value = 'BÉNÉFICE NET ESTIMÉ';
  sheet.getCell('E4').font = { size: 9, bold: true, color: { argb: 'FF059669' } };
  sheet.mergeCells('E5:F5');
  sheet.getCell('E5').value = `+${totalProfit.toFixed(2)} DH`;
  sheet.getCell('E5').font = { size: 14, bold: true, color: { argb: 'FF059669' } };

  // Volume Ventes Card
  sheet.mergeCells('H4:I4');
  sheet.getCell('H4').value = 'TRANSACTIONS';
  sheet.getCell('H4').font = { size: 9, bold: true, color: { argb: 'FF64748B' } };
  sheet.mergeCells('H5:I5');
  sheet.getCell('H5').value = `${completedSales.length} tickets validés`;
  sheet.getCell('H5').font = { size: 14, bold: true, color: { argb: 'FF0F172A' } };

  // Card Borders & Fills
  ['B', 'E', 'H'].forEach((col) => {
    const col2 = col === 'B' ? 'C' : col === 'E' ? 'F' : 'I';
    [`${col}4`, `${col2}4`, `${col}5`, `${col2}5`].forEach((cellRef) => {
      sheet.getCell(cellRef).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF8FAFC' },
      };
    });
  });

  // ==========================================
  // 3. TABLE COLUMN HEADERS (Row 7)
  // ==========================================
  const headers = [
    'N° Ticket',
    'Date',
    'Heure',
    'Client',
    'Règlement',
    'Statut',
    'Sous-Total',
    'Remise',
    'Total TTC',
    'Bénéfice Net',
    'Articles Détaillés',
  ];

  const headerRow = sheet.getRow(7);
  headerRow.values = headers;
  headerRow.height = 28;

  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4338CA' }, // Indigo
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF312E81' } },
      bottom: { style: 'medium', color: { argb: 'FF312E81' } },
    };
  });

  // ==========================================
  // 4. DATA ROWS (Rows 8+)
  // ==========================================
  let currentRowIndex = 8;

  sales.forEach((sale, index) => {
    const isCancelled = sale.status === 'cancelled';
    const dateObj = new Date(sale.created_at);
    const dateStr = dateObj.toLocaleDateString('fr-FR');
    const timeStr = dateObj.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const profit = isCancelled
      ? 0
      : sale.items.reduce(
          (sum, item) => sum + (item.unit_sell_price - item.unit_buy_price) * item.quantity,
          0
        ) - sale.discount_amount;

    const itemsSummary = sale.items
      .map((item) => `${item.quantity}x ${item.product_name}`)
      .join(', ');

    const row = sheet.getRow(currentRowIndex);
    row.values = [
      `#${sale.receipt_number}`,
      dateStr,
      timeStr,
      sale.customer?.name || 'Client Comptoir',
      sale.payment_method.toUpperCase(),
      isCancelled ? 'ANNULÉ' : 'VALIDÉ',
      sale.subtotal,
      sale.discount_amount,
      sale.total_amount,
      profit,
      itemsSummary,
    ];

    row.height = 22;

    // Formatting & Alignments
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(4).alignment = { horizontal: 'left', vertical: 'middle' };
    row.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };

    // Currency columns: Formatted with Moroccan DH
    [7, 8, 9, 10].forEach((colIdx) => {
      const cell = row.getCell(colIdx);
      cell.numFmt = '#,##0.00 "DH"';
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
    });

    row.getCell(11).alignment = { horizontal: 'left', vertical: 'middle' };

    // Zebra striping or Canceled styling
    const isEven = index % 2 === 0;
    const rowColor = isCancelled
      ? 'FFFEE2E2' // Soft Red for canceled
      : isEven
      ? 'FFFFFFFF'
      : 'FFF8FAFC'; // Soft Slate for alternating rows

    row.eachCell((cell, colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowColor },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };

      // Status text color
      if (colNumber === 6) {
        cell.font = {
          bold: true,
          color: { argb: isCancelled ? 'FFDC2626' : 'FF059669' },
        };
      }
      // Profit text color
      if (colNumber === 10 && !isCancelled) {
        cell.font = { bold: true, color: { argb: 'FF059669' } };
      }
    });

    currentRowIndex++;
  });

  // ==========================================
  // 5. TOTALS ROW (With Excel SUM Formulas)
  // ==========================================
  const totalRow = sheet.getRow(currentRowIndex);
  sheet.mergeCells(`A${currentRowIndex}:F${currentRowIndex}`);
  const labelCell = sheet.getCell(`A${currentRowIndex}`);
  labelCell.value = 'TOTAL GÉNÉRAL';
  labelCell.font = { bold: true, size: 11, color: { argb: 'FF0F172A' } };
  labelCell.alignment = { horizontal: 'right', vertical: 'middle' };

  // Formulas for totals
  totalRow.getCell(7).value = { formula: `SUM(G8:G${currentRowIndex - 1})` };
  totalRow.getCell(8).value = { formula: `SUM(H8:H${currentRowIndex - 1})` };
  totalRow.getCell(9).value = { formula: `SUM(I8:I${currentRowIndex - 1})` };
  totalRow.getCell(10).value = { formula: `SUM(J8:J${currentRowIndex - 1})` };

  [7, 8, 9, 10].forEach((colIdx) => {
    const cell = totalRow.getCell(colIdx);
    cell.numFmt = '#,##0.00 "DH"';
    cell.font = { bold: true, size: 11, color: { argb: 'FF0F172A' } };
    cell.alignment = { horizontal: 'right', vertical: 'middle' };
  });

  totalRow.height = 26;

  totalRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEEF2FF' }, // Soft Indigo
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF6366F1' } },
      bottom: { style: 'double', color: { argb: 'FF312E81' } }, // Accounting double underline
    };
  });

  // ==========================================
  // 6. AUTO-FIT COLUMN WIDTHS
  // ==========================================
  sheet.columns = [
    { key: 'ticket', width: 14 },
    { key: 'date', width: 14 },
    { key: 'time', width: 10 },
    { key: 'client', width: 22 },
    { key: 'payment', width: 16 },
    { key: 'status', width: 14 },
    { key: 'subtotal', width: 16 },
    { key: 'discount', width: 14 },
    { key: 'total', width: 18 },
    { key: 'profit', width: 18 },
    { key: 'items', width: 45 },
  ];

  // ==========================================
  // 7. DOWNLOAD EXCEL (.xlsx)
  // ==========================================
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const filename = `journal-ventes-maktaba-${periodLabel}-${new Date().toISOString().split('T')[0]}.xlsx`;

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}