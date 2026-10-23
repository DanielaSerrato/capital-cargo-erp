'use client';

import { useState, useEffect } from 'react';
import { X, Save, Edit3, ChevronDown } from 'lucide-react';
import { cn, titleCase, fullName, formatDate, getSupabaseFileUrl, isExpired } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { Lightbox } from '@/components/ui/Lightbox';
import type { Conductor, Propietario, Vehiculo, RuntLicencia, RuntVehiculo, LicenciaCategoria } from '@/types/database';
import {
  DOCUMENTO_LABELS_CONDUCTOR,
  DOCUMENTO_LABELS_PROPIETARIO,
  DOCUMENTO_LABELS_VEHICULO,
} from '@/types/database';

type Tab = 'datos' | 'documentos' | 'runt' | 'historial';
type Entity = Conductor | Propietario | Vehiculo;

interface Props {
  entity: Entity;
  entityType: 'conductores' | 'propietarios' | 'vehiculos';
  onClose: () => void;
  onUpdate: () => void;
}

const NAME_FIELDS = new Set([
  'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido',
  'ciudad', 'banco', 'ref_familiar_nombre', 'ref_empresa_nombre',
]);

export function DetailPanel({ entity, entityType, onClose, onUpdate }: Props) {
  const [tab, setTab] = useState<Tab>('datos');
  const [editMode, setEditMode] = useState(false);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [runtLicencia, setRuntLicencia] = useState<RuntLicencia | null>(null);
  const [runtVehiculo, setRuntVehiculo] = useState<RuntVehiculo | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setTab('datos');
    setEditMode(false);
    setEdits({});
    loadRunt();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity.id]);

  async function loadRunt() {
    if (entityType === 'conductores') {
      const c = entity as Conductor;
      if (c.cedula) {
        const { data } = await supabase
          .from('runt_licencias')
          .select('*')
          .eq('cedula', c.cedula)
          .order('fecha_consulta', { ascending: false })
          .limit(1)
          .single();
        setRuntLicencia(data);
      }
    }
    if (entityType === 'vehiculos') {
      const v = entity as Vehiculo;
      if (v.placa) {
        const { data } = await supabase
          .from('runt_vehiculos')
          .select('*')
          .eq('placa', v.placa)
          .order('fecha_consulta', { ascending: false })
          .limit(1)
          .single();
        setRuntVehiculo(data);
      }
    }
  }

  function handleEdit(field: string, value: string) {
    setEdits(prev => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (Object.keys(edits).length === 0) {
      setEditMode(false);
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from(entityType)
      .update(edits)
      .eq('id', entity.id);
    setSaving(false);
    if (error) {
      toast('Error al guardar: ' + error.message, 'error');
    } else {
      toast('Guardado correctamente');
      setEditMode(false);
      setEdits({});
      onUpdate();
    }
  }

  async function handleEstadoChange(newEstado: string) {
    const { error } = await supabase
      .from(entityType)
      .update({ estado: newEstado })
      .eq('id', entity.id);
    if (error) {
      toast('Error: ' + error.message, 'error');
    } else {
      toast(`Estado → ${newEstado}`);
      onUpdate();
    }
  }

  function getDisplayValue(field: string, value: string | null): string {
    if (!value) return '—';
    return NAME_FIELDS.has(field) ? titleCase(value) : value;
  }

  function renderField(field: string, label: string, value: string | null) {
    const display = getDisplayValue(field, value);
    if (editMode) {
      return (
        <div key={field} className="mb-3">
          <label className="text-xs text-slate-500 block mb-1">{label}</label>
          <input
            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            defaultValue={value || ''}
            onChange={e => handleEdit(field, e.target.value)}
          />
        </div>
      );
    }
    return (
      <div key={field} className="mb-3">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium">{display}</p>
      </div>
    );
  }

  function renderDatos() {
    if (entityType === 'conductores') {
      const c = entity as Conductor;
      return (
        <div className="grid grid-cols-2 gap-x-4">
          {renderField('primer_nombre', 'Primer Nombre', c.primer_nombre)}
          {renderField('segundo_nombre', 'Segundo Nombre', c.segundo_nombre)}
          {renderField('primer_apellido', 'Primer Apellido', c.primer_apellido)}
          {renderField('segundo_apellido', 'Segundo Apellido', c.segundo_apellido)}
          {renderField('cedula', 'Cédula', c.cedula)}
          {renderField('telefono', 'Teléfono', c.telefono)}
          {renderField('direccion', 'Dirección', c.direccion)}
          {renderField('ciudad', 'Ciudad', c.ciudad)}
          {renderField('vehiculo_placa', 'Placa Vehículo', c.vehiculo_placa)}
          {renderField('banco', 'Banco', c.banco)}
          {renderField('tipo_cuenta', 'Tipo Cuenta', c.tipo_cuenta)}
          {renderField('numero_cuenta', 'No. Cuenta', c.numero_cuenta)}
          <div className="col-span-2 border-t border-slate-100 pt-3 mt-2">
            <p className="text-xs font-semibold text-slate-600 mb-2">Referencias</p>
          </div>
          {renderField('ref_familiar_nombre', 'Ref. Familiar', c.ref_familiar_nombre)}
          {renderField('ref_familiar_telefono', 'Tel. Familiar', c.ref_familiar_telefono)}
          {renderField('ref_empresa_nombre', 'Ref. Empresa', c.ref_empresa_nombre)}
          {renderField('ref_empresa_telefono', 'Tel. Empresa', c.ref_empresa_telefono)}
        </div>
      );
    }
    if (entityType === 'propietarios') {
      const p = entity as Propietario;
      return (
        <div className="grid grid-cols-2 gap-x-4">
          {renderField('primer_nombre', 'Primer Nombre', p.primer_nombre)}
          {renderField('segundo_nombre', 'Segundo Nombre', p.segundo_nombre)}
          {renderField('primer_apellido', 'Primer Apellido', p.primer_apellido)}
          {renderField('segundo_apellido', 'Segundo Apellido', p.segundo_apellido)}
          {renderField('cedula', 'Cédula', p.cedula)}
          {renderField('telefono', 'Teléfono', p.telefono)}
          {renderField('direccion', 'Dirección', p.direccion)}
          {renderField('ciudad', 'Ciudad', p.ciudad)}
          {renderField('vehiculo_placa', 'Placa Vehículo', p.vehiculo_placa)}
          {renderField('banco', 'Banco', p.banco)}
          {renderField('tipo_cuenta', 'Tipo Cuenta', p.tipo_cuenta)}
          {renderField('numero_cuenta', 'No. Cuenta', p.numero_cuenta)}
          {renderField('factura_electronica', 'Factura Electrónica', p.factura_electronica)}
        </div>
      );
    }
    // vehiculos
    const v = entity as Vehiculo;
    return (
      <div className="grid grid-cols-2 gap-x-4">
        {renderField('placa', 'Placa', v.placa)}
        {renderField('tipo', 'Tipo', v.tipo)}
        {renderField('satelital', 'Satelital', v.satelital)}
        {renderField('satelital_proveedor', 'Proveedor Satelital', v.satelital_proveedor)}
        {renderField('satelital_usuario', 'Usuario Satelital', v.satelital_usuario)}
        {renderField('satelital_password', 'Password Satelital', v.satelital_password)}
      </div>
    );
  }

  function renderDocumentos() {
    const labels =
      entityType === 'conductores' ? DOCUMENTO_LABELS_CONDUCTOR :
      entityType === 'propietarios' ? DOCUMENTO_LABELS_PROPIETARIO :
      DOCUMENTO_LABELS_VEHICULO;

    const record = entity as unknown as Record<string, unknown>;

    return (
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(labels).map(([field, label]) => {
          const path = record[field] as string | null;
          const url = getSupabaseFileUrl(path);
          return (
            <div key={field} className={cn(
              'border rounded-lg p-3',
              url ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-slate-50'
            )}>
              <p className="text-xs font-medium text-slate-600 mb-1">{label}</p>
              {url ? (
                <button
                  onClick={() => setLightboxSrc(url)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Ver documento ↗
                </button>
              ) : (
                <p className="text-xs text-slate-400">No subido</p>
              )}
            </div>
          );
        })}
        {entityType === 'vehiculos' && (entity as Vehiculo).fotos && (
          <div className="col-span-2 border-t border-slate-100 pt-3 mt-1">
            <p className="text-xs font-semibold text-slate-600 mb-2">Fotos del vehículo</p>
            <div className="flex gap-2 flex-wrap">
              {((entity as Vehiculo).fotos || []).map((foto, i) => {
                const url = getSupabaseFileUrl(foto);
                return url ? (
                  <button
                    key={i}
                    onClick={() => setLightboxSrc(url)}
                    className="w-16 h-16 rounded border border-slate-200 overflow-hidden hover:ring-2 hover:ring-blue-400"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  function getAllCategories(): LicenciaCategoria[] {
    if (!runtLicencia?.licencias_json) return [];
    const json = runtLicencia.licencias_json;
    if (Array.isArray(json)) return json;
    return [];
  }

  function renderRunt() {
    if (entityType === 'vehiculos') {
      if (!runtVehiculo) return <p className="text-sm text-slate-400">Sin consulta RUNT</p>;
      if (!runtVehiculo.success) return <p className="text-sm text-red-500">Error: {runtVehiculo.error}</p>;
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div><p className="text-xs text-slate-500">Estado</p><p className="font-medium">{runtVehiculo.estado}</p></div>
            <div><p className="text-xs text-slate-500">Servicio</p><p className="font-medium">{runtVehiculo.tipo_servicio}</p></div>
            <div><p className="text-xs text-slate-500">Clase</p><p className="font-medium">{runtVehiculo.clase}</p></div>
            <div><p className="text-xs text-slate-500">Marca</p><p className="font-medium">{runtVehiculo.marca}</p></div>
            <div><p className="text-xs text-slate-500">Línea</p><p className="font-medium">{runtVehiculo.linea}</p></div>
            <div><p className="text-xs text-slate-500">Modelo</p><p className="font-medium">{runtVehiculo.modelo}</p></div>
            <div><p className="text-xs text-slate-500">Color</p><p className="font-medium">{runtVehiculo.color}</p></div>
            <div><p className="text-xs text-slate-500">Cilindraje</p><p className="font-medium">{runtVehiculo.cilindraje}</p></div>
          </div>
          <div className="border-t pt-3">
            <p className="text-xs font-semibold text-slate-600 mb-2">SOAT</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div><p className="text-xs text-slate-500">Póliza</p><p className="font-medium">{runtVehiculo.soat_poliza || '—'}</p></div>
              <div><p className="text-xs text-slate-500">Aseguradora</p><p className="font-medium">{runtVehiculo.soat_aseguradora || '—'}</p></div>
              <div><p className="text-xs text-slate-500">Vencimiento</p><p className={cn('font-medium', isExpired(runtVehiculo.soat_vencimiento) && 'text-red-600')}>{runtVehiculo.soat_vencimiento || '—'}</p></div>
              <div><p className="text-xs text-slate-500">Estado</p><p className="font-medium">{runtVehiculo.soat_estado || '—'}</p></div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Consultado: {formatDate(runtVehiculo.fecha_consulta)}</p>
        </div>
      );
    }

    // conductores
    if (!runtLicencia) return <p className="text-sm text-slate-400">Sin consulta RUNT</p>;
    if (!runtLicencia.success) return <p className="text-sm text-red-500">Error: {runtLicencia.error}</p>;

    const categorias = getAllCategories();

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div><p className="text-xs text-slate-500">Estado Conductor</p><p className="font-medium">{runtLicencia.estado_conductor || '—'}</p></div>
          <div><p className="text-xs text-slate-500">No. Licencia</p><p className="font-medium">{runtLicencia.numero_licencia || '—'}</p></div>
          <div><p className="text-xs text-slate-500">Org. Tránsito</p><p className="font-medium">{runtLicencia.organismo_transito || '—'}</p></div>
          <div><p className="text-xs text-slate-500">Restricciones</p><p className="font-medium">{runtLicencia.restricciones || 'Ninguna'}</p></div>
        </div>
        {categorias.length > 0 && (
          <div className="border-t pt-3">
            <p className="text-xs font-semibold text-slate-600 mb-2">Categorías ({categorias.length})</p>
            <div className="space-y-2">
              {categorias.map((cat, i) => {
                const expired = isExpired(cat.fechaVencimiento);
                return (
                  <div key={i} className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-lg text-sm border',
                    expired ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'
                  )}>
                    <div>
                      <span className="font-bold">{cat.categoria}</span>
                      <span className={cn('ml-2 text-xs', expired ? 'text-red-600' : 'text-emerald-600')}>
                        {cat.estado}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Vence: <span className={cn('font-medium', expired && 'text-red-600')}>{cat.fechaVencimiento}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <p className="text-xs text-slate-400 mt-2">Consultado: {formatDate(runtLicencia.fecha_consulta)}</p>
      </div>
    );
  }

  function renderHistorial() {
    return (
      <div className="text-sm text-slate-400 py-8 text-center">
        <p>Historial de cambios</p>
        <p className="text-xs mt-1">Disponible en Fase 2 (audit_events)</p>
      </div>
    );
  }

  const displayName = entityType === 'vehiculos'
    ? (entity as Vehiculo).placa
    : fullName(entity as Conductor | Propietario);

  const TABS: { key: Tab; label: string }[] = [
    { key: 'datos', label: 'Datos' },
    { key: 'documentos', label: 'Documentos' },
    ...(entityType !== 'propietarios' ? [{ key: 'runt' as Tab, label: 'RUNT' }] : []),
    { key: 'historial', label: 'Historial' },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-screen w-full max-w-lg bg-white shadow-2xl z-50 slide-in flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold truncate">{displayName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge estado={entity.estado} />
              <div className="relative group">
                <button className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-0.5">
                  Cambiar <ChevronDown size={12} />
                </button>
                <div className="hidden group-hover:block absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[140px] z-10">
                  {['pendiente', 'revisado', 'aprobado', 'rechazado'].map(e => (
                    <button
                      key={e}
                      onClick={() => handleEstadoChange(e)}
                      className="block w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 capitalize"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 ml-2">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-5">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'px-3 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                tab === t.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'datos' && renderDatos()}
          {tab === 'documentos' && renderDocumentos()}
          {tab === 'runt' && renderRunt()}
          {tab === 'historial' && renderHistorial()}
        </div>

        {/* Footer actions */}
        {tab === 'datos' && (
          <div className="px-5 py-3 border-t border-slate-100 flex justify-end gap-2">
            {editMode ? (
              <>
                <button
                  onClick={() => { setEditMode(false); setEdits({}); }}
                  className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Save size={14} />
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Edit3 size={14} />
                Editar
              </button>
            )}
          </div>
        )}
      </div>

      {lightboxSrc && (
        <Lightbox src={lightboxSrc} alt="Documento" onClose={() => setLightboxSrc(null)} />
      )}
    </>
  );
}
