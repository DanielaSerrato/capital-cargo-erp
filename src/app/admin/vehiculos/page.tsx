'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download } from 'lucide-react';

import { KpiBar } from '@/components/ui/KpiBar';
import { SearchFilter } from '@/components/ui/SearchFilter';
import { DataTable, Column } from '@/components/ui/DataTable';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { DetailPanel } from '@/components/detail/DetailPanel';
import { Badge } from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import { formatDate, countDocuments } from '@/lib/utils';
import { Vehiculo, DOCUMENTO_LABELS_VEHICULO } from '@/types/database';

// ─── Inner page (needs ToastProvider context) ────────────────────────────────

function VehiculosInner() {
  const { toast } = useToast();

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [selected, setSelected] = useState<Vehiculo | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchVehiculos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('vehiculos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast('Error cargando vehículos: ' + error.message, 'error');
    } else {
      setVehiculos(data ?? []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchVehiculos();
  }, [fetchVehiculos]);

  // ── Client-side filtering ──────────────────────────────────────────────────

  const filtered = vehiculos.filter(v => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (v.placa ?? '').toLowerCase().includes(q) ||
      (v.tipo ?? '').toLowerCase().includes(q);

    const matchesEstado = !estadoFilter || v.estado === estadoFilter;

    return matchesSearch && matchesEstado;
  });

  // ── KPI counts ─────────────────────────────────────────────────────────────

  const total = vehiculos.length;
  const pendientes = vehiculos.filter(v => v.estado === 'pendiente').length;
  const aprobados = vehiculos.filter(v => v.estado === 'aprobado').length;
  const rechazados = vehiculos.filter(v => v.estado === 'rechazado').length;

  const kpiItems = [
    { label: 'Total', value: total },
    { label: 'Pendientes', value: pendientes, color: 'border-amber-300 bg-amber-50' },
    { label: 'Aprobados', value: aprobados, color: 'border-emerald-300 bg-emerald-50' },
    { label: 'Rechazados', value: rechazados, color: 'border-red-300 bg-red-50' },
  ];

  // ── Table columns ──────────────────────────────────────────────────────────

  const columns: Column<Vehiculo>[] = [
    {
      key: 'placa',
      label: 'Placa',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-sm bg-slate-100 px-1.5 py-0.5 rounded uppercase">
          {row.placa}
        </span>
      ),
    },
    {
      key: 'tipo',
      label: 'Tipo',
      sortable: true,
      render: (row) => (
        <span className="text-slate-600">{row.tipo ?? '—'}</span>
      ),
    },
    {
      key: 'satelital',
      label: 'Satelital',
      render: (row) => {
        const display = row.satelital_proveedor || row.satelital;
        return display ? (
          <span className="text-slate-600">{display}</span>
        ) : (
          <span className="text-slate-400">—</span>
        );
      },
    },
    {
      key: 'docs',
      label: 'Docs',
      render: (row) => {
        const { uploaded, total: docTotal } = countDocuments(
          row as unknown as Record<string, unknown>,
          DOCUMENTO_LABELS_VEHICULO
        );
        const allDone = uploaded === docTotal;
        return (
          <span
            className={`text-xs font-medium tabular-nums ${
              allDone ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {uploaded}/{docTotal}
          </span>
        );
      },
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (row) => <Badge estado={row.estado} />,
    },
    {
      key: 'created_at',
      label: 'Fecha',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {formatDate(row.created_at)}
        </span>
      ),
      className: 'hidden sm:table-cell',
    },
  ];

  // ── CSV export ─────────────────────────────────────────────────────────────

  function handleDownloadCSV() {
    const headers = ['Placa', 'Tipo', 'Satelital', 'Docs', 'Estado', 'Fecha'];
    const rows = filtered.map(v => {
      const { uploaded, total: docTotal } = countDocuments(
        v as unknown as Record<string, unknown>,
        DOCUMENTO_LABELS_VEHICULO
      );
      return [
        v.placa,
        v.tipo ?? '',
        v.satelital_proveedor || v.satelital || '',
        `${uploaded}/${docTotal}`,
        v.estado,
        formatDate(v.created_at),
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vehiculos_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast('CSV descargado');
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vehículos</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? 'Cargando...' : `${filtered.length} de ${total} registros`}
          </p>
        </div>
        <button
          onClick={handleDownloadCSV}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <Download size={15} />
          Exportar CSV
        </button>
      </div>

      {/* KPIs */}
      <KpiBar items={kpiItems} />

      {/* Search + filter */}
      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        estadoFilter={estadoFilter}
        onEstadoChange={setEstadoFilter}
        placeholder="Buscar por placa, tipo..."
      />

      {/* Table */}
      <DataTable<Vehiculo>
        columns={columns}
        data={filtered}
        onRowClick={setSelected}
        rowKey={(row) => row.id}
        emptyMessage={
          loading
            ? 'Cargando vehículos...'
            : search || estadoFilter
            ? 'No hay vehículos que coincidan con los filtros.'
            : 'No hay vehículos registrados todavía.'
        }
      />

      {/* Detail panel */}
      {selected && (
        <DetailPanel
          entity={selected}
          entityType="vehiculos"
          onClose={() => setSelected(null)}
          onUpdate={() => {
            fetchVehiculos();
          }}
        />
      )}
    </div>
  );
}

// ─── Public export (wrapped in ToastProvider) ─────────────────────────────────

export default function VehiculosPage() {
  return (
    <ToastProvider>
      <VehiculosInner />
    </ToastProvider>
  );
}
