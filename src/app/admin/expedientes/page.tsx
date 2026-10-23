'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { fullName, titleCase, formatDate, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { SearchFilter } from '@/components/ui/SearchFilter';
import { ToastProvider } from '@/components/ui/Toast';
import { DetailPanel } from '@/components/detail/DetailPanel';
import { Car, User, UserCheck } from 'lucide-react';
import type { Conductor, Propietario, Vehiculo } from '@/types/database';

interface Expediente {
  placa: string;
  vehiculo: Vehiculo | null;
  conductor: Conductor | null;
  propietario: Propietario | null;
}

function ExpedientesInner() {
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<{
    entity: Conductor | Propietario | Vehiculo;
    type: 'conductores' | 'propietarios' | 'vehiculos';
  } | null>(null);

  const fetchExpedientes = useCallback(async () => {
    setLoading(true);

    const [vehiculosRes, conductoresRes, propietariosRes] = await Promise.all([
      supabase.from('vehiculos').select('*'),
      supabase.from('conductores').select('*'),
      supabase.from('propietarios').select('*'),
    ]);

    const vehiculos = vehiculosRes.data || [];
    const conductores = conductoresRes.data || [];
    const propietarios = propietariosRes.data || [];

    // Group by placa
    const placaMap = new Map<string, Expediente>();

    for (const v of vehiculos) {
      if (v.placa) {
        placaMap.set(v.placa, {
          placa: v.placa,
          vehiculo: v,
          conductor: null,
          propietario: null,
        });
      }
    }

    for (const c of conductores) {
      if (c.vehiculo_placa) {
        const exp = placaMap.get(c.vehiculo_placa) || {
          placa: c.vehiculo_placa,
          vehiculo: null,
          conductor: null,
          propietario: null,
        };
        exp.conductor = c;
        placaMap.set(c.vehiculo_placa, exp);
      }
    }

    for (const p of propietarios) {
      if (p.vehiculo_placa) {
        const exp = placaMap.get(p.vehiculo_placa) || {
          placa: p.vehiculo_placa,
          vehiculo: null,
          conductor: null,
          propietario: null,
        };
        exp.propietario = p;
        placaMap.set(p.vehiculo_placa, exp);
      }
    }

    setExpedientes(Array.from(placaMap.values()).sort((a, b) => a.placa.localeCompare(b.placa)));
    setLoading(false);
  }, []);

  useEffect(() => { fetchExpedientes(); }, [fetchExpedientes]);

  const filtered = expedientes.filter(exp => {
    if (search) {
      const s = search.toLowerCase();
      const matchPlaca = exp.placa.toLowerCase().includes(s);
      const matchConductor = exp.conductor ? fullName(exp.conductor).toLowerCase().includes(s) : false;
      const matchPropietario = exp.propietario ? fullName(exp.propietario).toLowerCase().includes(s) : false;
      if (!matchPlaca && !matchConductor && !matchPropietario) return false;
    }
    if (estadoFilter) {
      const vEstado = exp.vehiculo?.estado === estadoFilter;
      const cEstado = exp.conductor?.estado === estadoFilter;
      const pEstado = exp.propietario?.estado === estadoFilter;
      if (!vEstado && !cEstado && !pEstado) return false;
    }
    return true;
  });

  function completeness(exp: Expediente): { label: string; color: string } {
    const parts = [exp.vehiculo, exp.conductor, exp.propietario].filter(Boolean).length;
    if (parts === 3) return { label: 'Completo', color: 'text-emerald-600 bg-emerald-50' };
    if (parts >= 1) return { label: `${parts}/3`, color: 'text-amber-600 bg-amber-50' };
    return { label: 'Vacío', color: 'text-red-600 bg-red-50' };
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-400">Cargando expedientes...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expedientes</h1>
          <p className="text-sm text-slate-500 mt-0.5">Agrupados por placa — {filtered.length} vehículos</p>
        </div>
      </div>

      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        estadoFilter={estadoFilter}
        onEstadoChange={setEstadoFilter}
        placeholder="Buscar por placa, conductor o propietario..."
      />

      <div className="grid gap-4">
        {filtered.map(exp => {
          const comp = completeness(exp);
          return (
            <div key={exp.placa} className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-lg bg-slate-100 px-3 py-1 rounded-md uppercase">
                    {exp.placa}
                  </span>
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', comp.color)}>
                    {comp.label}
                  </span>
                </div>
                {exp.vehiculo && (
                  <span className="text-xs text-slate-400">{exp.vehiculo.tipo}</span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Vehículo */}
                <button
                  onClick={() => exp.vehiculo && setSelectedEntity({ entity: exp.vehiculo, type: 'vehiculos' })}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-lg border text-left transition-colors',
                    exp.vehiculo
                      ? 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer'
                      : 'border-dashed border-slate-200 bg-slate-50 cursor-default'
                  )}
                >
                  <Car size={16} className={exp.vehiculo ? 'text-blue-500' : 'text-slate-300'} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">Vehículo</p>
                    {exp.vehiculo ? (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge estado={exp.vehiculo.estado} />
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 mt-0.5">Sin registro</p>
                    )}
                  </div>
                </button>

                {/* Conductor */}
                <button
                  onClick={() => exp.conductor && setSelectedEntity({ entity: exp.conductor, type: 'conductores' })}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-lg border text-left transition-colors',
                    exp.conductor
                      ? 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer'
                      : 'border-dashed border-slate-200 bg-slate-50 cursor-default'
                  )}
                >
                  <User size={16} className={exp.conductor ? 'text-blue-500' : 'text-slate-300'} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">Conductor</p>
                    {exp.conductor ? (
                      <>
                        <p className="text-sm font-medium truncate">{fullName(exp.conductor)}</p>
                        <Badge estado={exp.conductor.estado} />
                      </>
                    ) : (
                      <p className="text-xs text-slate-400 mt-0.5">Sin asignar</p>
                    )}
                  </div>
                </button>

                {/* Propietario */}
                <button
                  onClick={() => exp.propietario && setSelectedEntity({ entity: exp.propietario, type: 'propietarios' })}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-lg border text-left transition-colors',
                    exp.propietario
                      ? 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer'
                      : 'border-dashed border-slate-200 bg-slate-50 cursor-default'
                  )}
                >
                  <UserCheck size={16} className={exp.propietario ? 'text-blue-500' : 'text-slate-300'} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">Propietario</p>
                    {exp.propietario ? (
                      <>
                        <p className="text-sm font-medium truncate">{fullName(exp.propietario)}</p>
                        <Badge estado={exp.propietario.estado} />
                      </>
                    ) : (
                      <p className="text-xs text-slate-400 mt-0.5">Sin asignar</p>
                    )}
                  </div>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedEntity && (
        <DetailPanel
          entity={selectedEntity.entity}
          entityType={selectedEntity.type}
          onClose={() => setSelectedEntity(null)}
          onUpdate={fetchExpedientes}
        />
      )}
    </div>
  );
}

export default function ExpedientesPage() {
  return (
    <ToastProvider>
      <ExpedientesInner />
    </ToastProvider>
  );
}
