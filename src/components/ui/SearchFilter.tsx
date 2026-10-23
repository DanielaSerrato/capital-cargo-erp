'use client';

import { Search, X } from 'lucide-react';

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  estadoFilter: string;
  onEstadoChange: (v: string) => void;
  placeholder?: string;
}

export function SearchFilter({ search, onSearchChange, estadoFilter, onEstadoChange, placeholder }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="relative flex-1 min-w-[200px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={placeholder || 'Buscar por nombre, cédula, placa...'}
          className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
        />
        {search && (
          <button onClick={() => onSearchChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        )}
      </div>
      <select
        value={estadoFilter}
        onChange={e => onEstadoChange(e.target.value)}
        className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      >
        <option value="">Todos los estados</option>
        <option value="pendiente">Pendiente</option>
        <option value="revisado">Revisado</option>
        <option value="aprobado">Aprobado</option>
        <option value="rechazado">Rechazado</option>
      </select>
    </div>
  );
}
