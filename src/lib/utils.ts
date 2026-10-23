export function titleCase(s: string | null): string {
  if (!s) return '';
  return s.toLowerCase().replace(/(?:^|\s)\S/g, c => c.toUpperCase());
}

export function fullName(r: {
  primer_nombre: string;
  segundo_nombre?: string | null;
  primer_apellido: string;
  segundo_apellido?: string | null;
}): string {
  return [r.primer_nombre, r.segundo_nombre, r.primer_apellido, r.segundo_apellido]
    .filter(Boolean)
    .map(s => titleCase(s as string))
    .join(' ');
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days}d`;
  return formatDate(dateStr);
}

export function isExpired(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

export function getSupabaseFileUrl(path: string | null, bucket: string = 'vinculacion-docs'): string | null {
  if (!path) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export function countDocuments(
  record: Record<string, unknown>,
  docFields: Record<string, string>
): { total: number; uploaded: number } {
  const fields = Object.keys(docFields);
  const total = fields.length;
  const uploaded = fields.filter(f => !!record[f]).length;
  return { total, uploaded };
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
