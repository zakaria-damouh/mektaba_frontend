'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { printElement } from '@/lib/print';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  TbPrinter,
  TbBrandWhatsapp,
  TbCircleCheck,
  TbBuildingStore,
  TbScissors,
  TbCopy,
  TbAlertTriangle,
} from 'react-icons/tb';

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
  onNewSale?: () => void;
}

export function ReceiptDialog({
  open,
  onOpenChange,
  saleData,
  onNewSale,
}: ReceiptDialogProps) {
  const { t } = useTranslation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [copiesToPrint, setCopiesToPrint] = useState<1 | 2>(1);

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
      printElement('printable-receipt');
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
    <div className="font-mono text-xs text-neutral-800 space-y-2.5 p-3">
      {isCancelled && (
        <div className="text-center font-bold text-xs bg-black text-white py-1 uppercase tracking-wider rounded-xs">
          *** TICKET ANNULÉ / REMBOURSÉ ***
        </div>
      )}

      {copiesToPrint === 2 && (
        <div className="text-center font-bold text-[11px] tracking-wider border-b border-dashed border-neutral-300 pb-1">
          {type === 'CLIENT'
            ? '*** EXEMPLAIRE CLIENT ***'
            : '*** EXEMPLAIRE MAGASIN (CAISSE) ***'}
        </div>
      )}

      <div className="text-center space-y-0.5 border-b border-dashed border-neutral-300 pb-2">
        <div className="flex items-center justify-center gap-1.5 font-black text-sm text-neutral-900">
          <TbBuildingStore className="h-4 w-4" />
          MAKTABA POS
        </div>
        <div className="text-[10px] text-neutral-500 font-medium">Fournitures • Livres • Services</div>
        <div className="text-[10px] text-neutral-400">
          Ticket #{saleData.receiptNumber} •{' '}
          {new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          }).format(saleData.date)}
        </div>
        {saleData.customerName && (
          <div className="text-[10px] font-bold text-neutral-800 pt-0.5">
            Client : {saleData.customerName}
          </div>
        )}
      </div>

      <div className="space-y-1.5 py-1">
        {saleData.items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-baseline gap-2">
            <div className="truncate flex-1">
              <span className="font-bold">{item.quantity}x</span> {item.name}
            </div>
            <div className="font-black text-neutral-900 shrink-0">
              {item.total.toFixed(2)} DH
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-neutral-300 pt-2 space-y-1 text-[11px]">
        <div className="flex justify-between text-neutral-500">
          <span>Sous-total:</span>
          <span>{saleData.subtotal.toFixed(2)} DH</span>
        </div>
        {saleData.discount > 0 && (
          <div className="flex justify-between text-rose-600 font-bold">
            <span>Remise:</span>
            <span>-{saleData.discount.toFixed(2)} DH</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-black text-neutral-900 pt-1 border-t border-neutral-200">
          <span>TOTAL:</span>
          <span>{saleData.total.toFixed(2)} DH</span>
        </div>
        <div className="text-[10px] text-neutral-400 text-right uppercase">
          Règlement: {saleData.paymentMethod}
        </div>
      </div>

      {isCancelled ? (
        <div className="text-center text-[10px] text-neutral-500 pt-2 border-t border-dashed border-neutral-300 italic">
          Ticket annulé ({saleData.cancellationReason || 'Erreur'})
        </div>
      ) : type === 'CLIENT' ? (
        <div className="text-center text-[10px] text-neutral-400 pt-2 border-t border-dashed border-neutral-300">
          Merci pour votre visite ! شكراً لزيارتكم
        </div>
      ) : (
        <div className="pt-2 border-t border-dashed border-neutral-300 space-y-2">
          <div className="text-[10px] text-neutral-400">Archivage Caisse / Magasin</div>
          <div className="border-b border-dotted border-neutral-400 h-4 w-full"></div>
          <div className="text-[9px] text-right text-neutral-400 italic">Signature / Visa</div>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-neutral-200/90">
        <DialogHeader className="border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2.5">
            {isCancelled ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/60 shadow-xs">
                <TbAlertTriangle className="h-5 w-5 stroke-[2.2]" />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-xs">
                <TbCircleCheck className="h-5 w-5 stroke-[2.2]" />
              </div>
            )}
            <div>
              <DialogTitle className="text-base font-black tracking-tight text-neutral-900">
                {isCancelled ? t('history.cancelModalTitle') : t('caisse.receiptSuccess')} #{saleData.receiptNumber}
              </DialogTitle>
              <p className="text-[11px] text-neutral-400 font-medium">
                {isCancelled ? t('history.ticketCancelledOn') : t('caisse.receiptSuccess')}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 max-h-[42vh] overflow-y-auto">
          <div id="printable-receipt">
            {renderSingleReceipt('CLIENT')}

            {copiesToPrint === 2 && (
              <>
                <div className="receipt-page-break my-3 border-b-2 border-dashed border-neutral-400 py-1 text-center font-mono text-[10px] text-neutral-500 flex items-center justify-center gap-1.5">
                  <TbScissors className="h-3.5 w-3.5 stroke-[2.2]" />
                  - - - - COUPER ICI / CUT HERE - - - -
                </div>
                {renderSingleReceipt('MAGASIN')}
              </>
            )}
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
            <TbBrandWhatsapp className="h-4 w-4 text-emerald-600 stroke-[2.2]" />
            {t('caisse.whatsappPhone')}
          </label>
          <Input
            placeholder="ex: 06 12 34 56 78"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="bg-white rounded-xl border-neutral-200 text-xs focus-visible:ring-emerald-600/10 focus-visible:border-emerald-600"
          />
        </div>

        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              onClick={() => printWithCopies(1)}
              className="h-10 gap-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full font-bold text-xs shadow-xs hover:scale-101 active:scale-[0.99] transition-all cursor-pointer"
            >
              <TbPrinter className="h-4 w-4 stroke-[2.2]" />
              {t('caisse.printOne')}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => printWithCopies(2)}
              className="h-10 gap-2 border-neutral-200 hover:bg-neutral-100 text-neutral-800 rounded-full font-bold text-xs hover:scale-101 active:scale-[0.99] transition-all cursor-pointer"
            >
              <TbCopy className="h-4 w-4 stroke-[2.2]" />
              {t('caisse.printTwo')}
            </Button>
          </div>

          <Button
            type="button"
            onClick={handleWhatsAppShare}
            className="w-full h-10 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-black text-xs shadow-sm shadow-emerald-600/20 hover:scale-101 active:scale-[0.99] transition-all cursor-pointer"
          >
            <TbBrandWhatsapp className="h-4 w-4 stroke-[2.2]" />
            {t('caisse.shareWhatsApp')}
          </Button>
        </div>

        <Button
          type="button"
          onClick={() => {
            onOpenChange(false);
            setCopiesToPrint(1);
            if (onNewSale) onNewSale();
          }}
          variant="ghost"
          className="w-full text-neutral-400 hover:text-neutral-900 font-bold text-xs rounded-full cursor-pointer -mt-1"
        >
          {onNewSale ? t('caisse.nextCustomer') : t('common.close')}
        </Button>
      </DialogContent>
    </Dialog>
  );
}