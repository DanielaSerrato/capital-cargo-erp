'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Car, FileText, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/admin/conductores', label: 'Conductores', icon: Users },
  { href: '/admin/propietarios', label: 'Propietarios', icon: FileText },
  { href: '/admin/vehiculos', label: 'Vehículos', icon: Car },
  { href: '/admin/expedientes', label: 'Expedientes', icon: Truck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-slate-900 text-white flex flex-col z-40">
      <div className="px-5 py-5 border-b border-slate-700">
        <h1 className="text-lg font-bold tracking-tight">Capital Cargo</h1>
        <p className="text-xs text-slate-400 mt-0.5">ERP Vinculación</p>
      </div>
      <nav className="flex-1 py-3">
        {NAV_ITEMS.map(item => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-5 py-2.5 text-sm transition-colors',
                active
                  ? 'bg-blue-600/20 text-blue-300 border-r-2 border-blue-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-slate-700 text-xs text-slate-500">
        v1.0 — Fase 1
      </div>
    </aside>
  );
}
