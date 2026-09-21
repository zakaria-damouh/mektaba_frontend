import { SaleWithItems } from '@/components/historique/sales-list';

export function exportSalesToCSV(sales: SaleWithItems[], periodLabel: string) {
  if (sales.length === 0) {
    alert('Aucune vente à exporter pour cette période.');
    return;
  }

  // Column Headers (Semicolon delimited for French/Moroccan Excel)
  const headers = [
    'N° Ticket',
    'Date',
    'Heure',
    'Client',
    'Mode de Règlement',
    'Statut',
    'Sous-Total (DH)',
    'Remise (DH)',
    'Total TTC (DH)',
    'Marge Nette (DH)',
    'Détail des Articles',
  ];

  const rows = sales.map((sale) => {
    const dateObj = new Date(sale.created_at);
    const dateStr = dateObj.toLocaleDateString('fr-FR');
    const timeStr = dateObj.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const profit =
      sale.status === 'cancelled'
        ? 0
        : sale.items.reduce(
            (sum, item) => sum + (item.unit_sell_price - item.unit_buy_price) * item.quantity,
            0
          ) - sale.discount_amount;

    const itemsSummary = sale.items
      .map((item) => `${item.quantity}x ${item.product_name}`)
      .join(' + ');

    const clientName = sale.customer?.name || 'Client Comptoir';
    const statusLabel = sale.status === 'cancelled' ? 'ANNULÉ' : 'VALIDÉ';

    return [
      `#${sale.receipt_number}`,
      dateStr,
      timeStr,
      `"${clientName.replace(/"/g, '""')}"`,
      sale.payment_method.toUpperCase(),
      statusLabel,
      sale.subtotal.toFixed(2),
      sale.discount_amount.toFixed(2),
      sale.total_amount.toFixed(2),
      profit.toFixed(2),
      `"${itemsSummary.replace(/"/g, '""')}"`,
    ].join(';');
  });

  // Prepend \uFEFF (UTF-8 BOM) so Microsoft Excel opens French accents and Arabic cleanly
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const filename = `ventes-maktaba-${periodLabel}-${new Date().toISOString().split('T')[0]}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}