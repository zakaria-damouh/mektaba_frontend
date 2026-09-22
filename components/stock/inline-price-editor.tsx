'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TbPencil, TbLoader2 } from 'react-icons/tb';

interface InlinePriceEditorProps {
  productId: string;
  field: 'sell_price' | 'buy_price';
  initialValue: number;
  label?: string;
  onSave: (params: { id: string; field: 'sell_price' | 'buy_price'; value: number }) => Promise<void> | void;
}

export function InlinePriceEditor({
  productId,
  field,
  initialValue,
  onSave,
}: InlinePriceEditorProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue.toString());
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(initialValue.toString());
  }, [initialValue]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue < 0) {
      setValue(initialValue.toString());
      setIsEditing(false);
      return;
    }

    if (numericValue === initialValue) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave({ id: productId, field, value: numericValue });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setValue(initialValue.toString());
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setValue(initialValue.toString());
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="inline-flex items-center gap-1">
        <input
          ref={inputRef}
          type="number"
          step="0.10"
          min="0"
          value={value}
          disabled={isSaving}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="w-20 h-7 rounded-full border border-emerald-600 bg-white px-2.5 text-xs font-bold text-neutral-900 shadow-sm focus:outline-hidden ring-2 ring-emerald-600/10"
        />
        <span className="text-[11px] font-extrabold text-emerald-700">{t('common.dh')}</span>
        {isSaving && <TbLoader2 className="h-3 w-3 animate-spin text-emerald-600" />}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      title={t('common.edit')}
      className="group inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 -mx-1.5 text-start transition-all hover:bg-emerald-50/80 cursor-pointer"
    >
      <span
        className={`text-xs ${
          field === 'sell_price'
            ? 'font-black text-neutral-900 group-hover:text-emerald-700'
            : 'font-semibold text-neutral-500 group-hover:text-emerald-700'
        }`}
      >
        {initialValue.toFixed(2)} {t('common.dh')}
      </span>
      <TbPencil className="h-2.5 w-2.5 opacity-0 text-emerald-600 transition-opacity group-hover:opacity-100 stroke-[2.5]" />
    </button>
  );
}