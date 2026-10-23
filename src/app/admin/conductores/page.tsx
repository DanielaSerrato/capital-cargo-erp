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
import { fullName, titleCase, formatDate, countDocuments } from '@/lib/utils';
import { Conductor, DOCUMENTO_LABELS_CONDUCTOR } from '@/types/database';

// ─── Inner page (needs ToastProvider context) ────────────────────────────────

function ConductoresInner() {
  const { toast } = useToast();

  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [selected, setSelected] = useState<Conductor | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchConductores = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('conductores')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast('Error cargando conductores: ' + error.message, 'error');
    } else {
      setConductores(data ?? []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchConductores();
  }, [fetchConductores]);

  // ── Client-side filtering ──────────────────────────────────────────────────

  const filtered = conductores.filter(c => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      fullName(c).toLowerCase().includes(q) ||
      (c.cedula ?? '').toLowerCase().includes(q) ||
      (c.vehiculo_placa ?? '').toLowerCase().includes(q);

    const matchesEstado = !estadoFilter || c.estado === estadoFilter;

    return matchesSearch && matchesEstado;
  });

  // ── KPI counts ─────────────────────────────────────────────────────────────

  const total = conductores.length;
  const pendientes = conductores.filter(c => c.estado === 'pendiente').length;
  const aprobados = conductores.filter(c => c.estado === 'aprobado').length;
  const rechazados = conductores.filter(c => c.estado === 'rechazado').length;

  const kpiItems = [
    { label: 'Total', value: total },
    { label: 'Pendientes', value: pendientes, color: 'border-amber-300 bg-amber-50' },
    { label: 'Aprobados', value: aprobados, color: 'border-emerald-300 bg-emerald-50' },
    { label: 'Rechazados', value: rechazados, color: 'border-red-300 bg-red-50' },
  ];

  // ── Table columns ──────────────────────────────────────────────────────────

  const columns: Column<Conductor>[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      render: (row) => (
        <span className="font-medium text-slate-800">{fullName(row)}</span>
      ),
    },
    {
      key: 'cedula',
      label: 'Cédula',
      sortable: true,
      render: (row) => (
        <span className="tabular-nums text-slate-600">{row.cedula ?? '—'}</span>
      ),
    },
    {
      key: 'ciudad',
      label: 'Ciudad',
      sortable: true,
      render: (row) => (
        <span className="text-slate-600">{row.ciudad ? titleCase(row.ciudad) : '—'}</span>
      ),
    },
    {
      key: 'vehiculo_placa',
      label: 'Placa',
      render: (row) =>
        row.vehiculo_placa ? (
          <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded uppercase">
            {row.vehiculo_placa}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: 'docs',
      label: 'Docs',
      render: (row) => {
        const { uploaded, total: docTotal } = countDocuments(
          row as unknown as Record<string, unknown>,
          DOCUMENTO_LABELS_CONDUCTOR
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
    const headers = ['Nombre', 'Cédula', 'Ciudad', 'Placa', 'Teléfono', 'Estado', 'Fecha'];
    const rows = filtered.map(c => [
      fullName(c),
      c.cedula ?? '',
      c.ciudad ? titleCase(c.ciudad) : '',
      c.vehiculo_placa ?? '',
      c.telefono ?? '',
      c.estado,
      formatDate(c.created_at),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conductores_${new Date().toISOString().slice(0, 10)}.csv`;
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
          <h1 className="text-2xl font-bold text-slate-800">Conductores</h1>
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
        placeholder="Buscar por nombre, cédula, placa..."
      />

      {/* Table */}
      <DataTable<Conductor>
        columns={columns}
        data={filtered}
        onRowClick={setSelected}
        rowKey={(row) => row.id}
        emptyMessage={
          loading
            ? 'Cargando conductores...'
            : search || estadoFilter
            ? 'No hay conductores que coincidan con los filtros.'
            : 'No hay conductores registrados todavía.'
        }
      />

      {/* Detail panel */}
      {selected && (
        <DetailPanel
          entity={selected}
          entityType="conductores"
          onClose={() => setSelected(null)}
          onUpdate={() => {
            fetchConductores();
            // Refresh the selected entity from the updated list
            // (DetailPanel calls onUpdate after a save, re-fetch handles the rest)
          }}
        />
      )}
    </div>
  );
}

// ─── Public export (wrapped in ToastProvider) ─────────────────────────────────

export default function ConductoresPage() {
  return (
    <ToastProvider>
      <ConductoresInner />
    </ToastProvider>
  );
}
