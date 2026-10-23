import { ESTADO_COLORS } from '@/types/database';
import { cn } from '@/lib/utils';

export function Badge({ estado }: { estado: string }) {
  const color = ESTADO_COLORS[estado] || 'bg-gray-100 text-gray-600';
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize', color)}>
      {estado}
    </span>
  );
}
