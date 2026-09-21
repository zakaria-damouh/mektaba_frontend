'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Printer,
  Share2,
  CheckCircle2,
  Store,
  MessageCircle,
  Scissors,
  Copy,
  AlertTriangle,
} from 'lucide-react';

export interface CompletedSaleData {
  receiptNumber: number | string;
  items: {
    name: string;
    quantity: number;
    unit_price: number;
    total: number;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  date: Date;
  status?: 'completed' | 'cancelled';
  cancellationReason?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
}

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saleData: CompletedSaleData | null;
  onNewSale?: () => void; // <-- Made optional with ?
}

export function ReceiptDialog({
  open,
  onOpenChange,
  saleData,
  onNewSale,
}: ReceiptDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [copiesToPrint, setCopiesToPrint] = useState<1 | 2>(1);

  // Pre-fill phone number if sale had customer phone
  useEffect(() => {
    if (saleData?.customerPhone) {
      setPhoneNumber(saleData.customerPhone);
    } else {
      setPhoneNumber('');
    }
  }, [saleData]);

  if (!saleData) return null;

  const isCancelled = saleData.status === 'cancelled';

  const printWithCopies = (copies: 1 | 2) => {
    setCopiesToPrint(copies);
    setTimeout(() => {
      window.print();
    }, 80);
  };

  const handleWhatsAppShare = () => {
    const formattedDate = new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(saleData.date);

    let message = isCancelled
      ? `⚠️ *TICKET ANNULÉ / REMBOURSÉ*\n`
      : `📚 *MAKTABA - BON DE VENTE*\n`;

    message += `Ticket N°: *#${saleData.receiptNumber}*\n`;
    message += `Date: ${formattedDate}\n`;
    if (saleData.customerName) {
      message += `Client: *${saleData.customerName}*\n`;
    }
    message += `--------------------------------\n`;

    saleData.items.forEach((item) => {
      message += `• ${item.quantity}x ${item.name} (${item.unit_price.toFixed(2)} DH) = *${item.total.toFixed(2)} DH*\n`;
    });

    message += `--------------------------------\n`;
    if (saleData.discount > 0) {
      message += `Sous-total: ${saleData.subtotal.toFixed(2)} DH\n`;
      message += `Remise: -${saleData.discount.toFixed(2)} DH\n`;
    }
    message += `*TOTAL: ${saleData.total.toFixed(2)} DH*\n`;
    message += `Paiement: ${saleData.paymentMethod.toUpperCase()}\n`;
    if (isCancelled) {
      message += `*STATUT : TICKET ANNULÉ*\n`;
    }
    message += `--------------------------------\n`;
    message += `_Merci pour votre visite ! شكراً لزيارتكم_`;

    let cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = `212${cleanPhone.substring(1)}`;
    }

    const whatsappUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
  };

  const renderSingleReceipt = (type: 'CLIENT' | 'MAGASIN') => (
    <div className="font-mono text-xs text-slate-800 space-y-2.5 p-3">
      {/* Cancellation Banner */}
      {isCancelled && (
        <div className="text-center font-bold text-xs bg-black text-white py-1 uppercase tracking-wider">
          *** TICKET ANNULÉ / REMBOURSÉ ***
        </div>
      )}

      {/* 2 Copies Header */}
      {copiesToPrint === 2 && (
        <div className="text-center font-bold text-[11px] tracking-wider border-b border-dashed border-slate-300 pb-1">
          {type === 'CLIENT'
            ? '*** EXEMPLAIRE CLIENT ***'
            : '*** EXEMPLAIRE MAGASIN (CAISSE) ***'}
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-2">
        <div className="flex items-center justify-center gap-1.5 font-bold text-sm text-slate-900">
          <Store className="h-4 w-4" />
          MAKTABA POS
        </div>
        <div className="text-[10px] text-slate-500">Fournitures • Livres • Services</div>
        <div className="text-[10px] text-slate-400">
          Ticket #{saleData.receiptNumber} •{' '}
          {new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          }).format(saleData.date)}
        </div>
        {saleData.customerName && (
          <div className="text-[10px] font-bold text-slate-800">
            Client : {saleData.customerName}
          </div>
        )}
      </div>

      {/* Items list */}
      <div className="space-y-1.5 py-1">
        {saleData.items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-baseline gap-2">
            <div className="truncate flex-1">
              <span className="font-bold">{item.quantity}x</span> {item.name}
            </div>
            <div className="font-bold text-slate-900 shrink-0">
              {item.total.toFixed(2)} DH
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[11px]">
        <div className="flex justify-between text-slate-500">
          <span>Sous-total:</span>
          <span>{saleData.subtotal.toFixed(2)} DH</span>
        </div>
        {saleData.discount > 0 && (
          <div className="flex justify-between text-rose-600 font-bold">
            <span>Remise:</span>
            <span>-{saleData.discount.toFixed(2)} DH</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
          <span>TOTAL:</span>
          <span>{saleData.total.toFixed(2)} DH</span>
        </div>
        <div className="text-[10px] text-slate-400 text-right uppercase">
          Règlement: {saleData.paymentMethod}
        </div>
      </div>

      {/* Footer */}
      {isCancelled ? (
        <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-dashed border-slate-300 italic">
          Ticket annulé ({saleData.cancellationReason || 'Erreur'})
        </div>
      ) : type === 'CLIENT' ? (
        <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-dashed border-slate-300">
          Merci pour votre visite ! شكراً لزيارتكم
        </div>
      ) : (
        <div className="pt-2 border-t border-dashed border-slate-300 space-y-2">
          <div className="text-[10px] text-slate-400">Archivage Caisse / Magasin</div>
          <div className="border-b border-dotted border-slate-400 h-4 w-full"></div>
          <div className="text-[9px] text-right text-slate-400 italic">Signature / Visa</div>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {isCancelled ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            )}
            <DialogTitle className="text-lg font-bold text-slate-900">
              {isCancelled ? 'Ticket Annulé' : 'Bon de Vente'} #{saleData.receiptNumber}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Screen Preview Container */}
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 max-h-[42vh] overflow-y-auto">
          <div id="printable-receipt">
            {renderSingleReceipt('CLIENT')}

            {copiesToPrint === 2 && (
              <>
                <div className="receipt-page-break my-3 border-b-2 border-dashed border-slate-400 py-1 text-center font-mono text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
                  <Scissors className="h-3 w-3" />
                  - - - - COUPER ICI / CUT HERE - - - -
                </div>
                {renderSingleReceipt('MAGASIN')}
              </>
            )}
          </div>
        </div>

        {/* WhatsApp Customer Input */}
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
            Numéro WhatsApp du client
          </label>
          <Input
            placeholder="ex: 06 12 34 56 78"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="bg-white text-xs"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              onClick={() => printWithCopies(1)}
              className="gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              Imprimer (1 Bon)
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => printWithCopies(2)}
              className="gap-2 border-slate-300 hover:bg-slate-50 text-slate-800 font-bold cursor-pointer"
            >
              <Copy className="h-4 w-4" />
              2 Exemplaires
            </Button>
          </div>

          <Button
            type="button"
            onClick={handleWhatsAppShare}
            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
            Partager sur WhatsApp
          </Button>
        </div>

        {/* Dismiss / Close Button */}
        <Button
          type="button"
          onClick={() => {
            onOpenChange(false);
            setCopiesToPrint(1);
            if (onNewSale) onNewSale();
          }}
          variant="ghost"
          className="w-full text-slate-500 hover:text-slate-900 font-semibold text-xs cursor-pointer"
        >
          {onNewSale ? 'Passer au client suivant (Nouvelle Vente)' : 'Fermer'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}