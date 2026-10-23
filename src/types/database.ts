export interface Conductor {
  id: string;
  created_at: string;
  estado: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  cedula: string;
  direccion: string | null;
  ciudad: string | null;
  telefono: string | null;
  vehiculo_placa: string | null;
  banco: string | null;
  tipo_cuenta: string | null;
  numero_cuenta: string | null;
  foto_rostro: string | null;
  seguridad_social: string | null;
  cedula_frente: string | null;
  cedula_reverso: string | null;
  pase_frente: string | null;
  pase_reverso: string | null;
  cert_bancaria: string | null;
  ref_familiar_nombre: string | null;
  ref_familiar_telefono: string | null;
  ref_empresa_nombre: string | null;
  ref_empresa_telefono: string | null;
  autoriza_datos: boolean | null;
  autoriza_sensibles: boolean | null;
}

export interface Propietario {
  id: string;
  created_at: string;
  estado: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  cedula: string;
  direccion: string | null;
  ciudad: string | null;
  telefono: string | null;
  vehiculo_placa: string | null;
  banco: string | null;
  tipo_cuenta: string | null;
  numero_cuenta: string | null;
  factura_electronica: string | null;
  autoriza_sensibles: boolean | null;
  cedula_frente: string | null;
  cedula_reverso: string | null;
  rut: string | null;
  cert_bancaria: string | null;
}

export interface Vehiculo {
  id: string;
  created_at: string;
  estado: string;
  placa: string;
  tipo: string | null;
  satelital: string | null;
  satelital_proveedor: string | null;
  satelital_usuario: string | null;
  satelital_password: string | null;
  tarjeta_frente: string | null;
  tarjeta_reverso: string | null;
  tecnomecanica: string | null;
  soat: string | null;
  fotos: string[] | null;
}

export interface RuntLicencia {
  id: string;
  cedula: string;
  estado_conductor: string | null;
  estado_licencia: string | null;
  categoria: string | null;
  fecha_vencimiento_cat: string | null;
  restricciones: string | null;
  numero_licencia: string | null;
  organismo_transito: string | null;
  success: boolean;
  error: string | null;
  fecha_consulta: string;
  licencias_json: LicenciaCategoria[] | null;
}

export interface LicenciaCategoria {
  categoria: string;
  fechaExpedicion: string;
  fechaVencimiento: string;
  estado: string;
}

export interface RuntVehiculo {
  id: string;
  placa: string;
  estado: string | null;
  tipo_servicio: string | null;
  clase: string | null;
  marca: string | null;
  linea: string | null;
  modelo: string | null;
  color: string | null;
  cilindraje: string | null;
  soat_poliza: string | null;
  soat_aseguradora: string | null;
  soat_vencimiento: string | null;
  soat_estado: string | null;
  success: boolean;
  error: string | null;
  fecha_consulta: string;
}

export type EntityType = 'conductores' | 'propietarios' | 'vehiculos';

export type EstadoRevision = 'pendiente' | 'revisado' | 'aprobado' | 'rechazado';

export const ESTADO_COLORS: Record<string, string> = {
  pendiente: 'bg-amber-100 text-amber-800',
  revisado: 'bg-blue-100 text-blue-800',
  aprobado: 'bg-emerald-100 text-emerald-800',
  rechazado: 'bg-red-100 text-red-800',
};

export const DOCUMENTO_LABELS_CONDUCTOR: Record<string, string> = {
  foto_rostro: 'Foto Rostro',
  seguridad_social: 'Seguridad Social',
  cedula_frente: 'Cédula Frente',
  cedula_reverso: 'Cédula Reverso',
  pase_frente: 'Pase Frente',
  pase_reverso: 'Pase Reverso',
  cert_bancaria: 'Cert. Bancaria',
};

export const DOCUMENTO_LABELS_PROPIETARIO: Record<string, string> = {
  cedula_frente: 'Cédula Frente',
  cedula_reverso: 'Cédula Reverso',
  rut: 'RUT',
  cert_bancaria: 'Cert. Bancaria',
};

export const DOCUMENTO_LABELS_VEHICULO: Record<string, string> = {
  tarjeta_frente: 'Tarjeta Propiedad Frente',
  tarjeta_reverso: 'Tarjeta Propiedad Reverso',
  tecnomecanica: 'Tecnomecánica',
  soat: 'SOAT',
};
