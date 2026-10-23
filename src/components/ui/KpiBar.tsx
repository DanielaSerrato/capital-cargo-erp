'use client';

import { cn } from '@/lib/utils';

interface KpiItem {
  label: string;
  value: number;
  color?: string;
}

export function KpiBar({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {items.map(item => (
        <div
          key={item.label}
          className={cn(
            'rounded-lg border px-4 py-3 bg-white',
            item.color || 'border-slate-200'
          )}
        >
          <p className="text-2xl font-bold">{item.value}</p>
          <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
