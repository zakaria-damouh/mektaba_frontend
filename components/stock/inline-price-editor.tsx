'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, X, Loader2, Pencil } from 'lucide-react';

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
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue.toString());
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync value when initialValue changes from queries
  useEffect(() => {
    setValue(initialValue.toString());
  }, [initialValue]);

  // Focus input automatically when entering edit mode
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
        <div className="relative">
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
            className="w-20 h-7 rounded-md border border-indigo-500 bg-white px-1.5 text-xs font-bold text-slate-900 shadow-xs focus:outline-hidden"
          />
        </div>
        <span className="text-[11px] font-semibold text-slate-400">DH</span>

        {isSaving && <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      title="Cliquer pour modifier le prix"
      className="group inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 -mx-1.5 text-left transition-colors hover:bg-indigo-50/70 cursor-pointer"
    >
      <span
        className={`text-xs ${
          field === 'sell_price'
            ? 'font-bold text-slate-900 group-hover:text-indigo-600'
            : 'font-semibold text-slate-500 group-hover:text-indigo-600'
        }`}
      >
        {initialValue.toFixed(2)} DH
      </span>
      <Pencil className="h-2.5 w-2.5 opacity-0 text-indigo-600 transition-opacity group-hover:opacity-100" />
    </button>
  );
}