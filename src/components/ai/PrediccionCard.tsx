import { AlertTriangle, Clock, Package, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { PrediccionRestockFragment } from '@/generated/graphql';
import { cn } from '@/lib/utils';

interface Props {
  prediccion: PrediccionRestockFragment;
}

type Urgencia = 'alta' | 'media' | 'baja';

/**
 * Normaliza la urgencia a un set conocido. La IA puede devolver mayusculas/
 * minusculas/acentos; defendemos contra eso para no romper estilos.
 */
function normalizarUrgencia(raw: string): Urgencia {
  const u = raw.toLowerCase().trim();
  if (u.includes('alta') || u.includes('urgente') || u.includes('critic')) return 'alta';
  if (u.includes('media') || u.includes('medi')) return 'media';
  return 'baja';
}

const URGENCIA_STYLE: Record<Urgencia, { card: string; badge: string; label: string; icon: string }> = {
  alta: {
    card: 'border-red-300 bg-red-50/50',
    badge: 'bg-red-100 text-red-900 border-red-200',
    label: 'URGENCIA ALTA',
    icon: 'text-red-600',
  },
  media: {
    card: 'border-amber-300 bg-amber-50/50',
    badge: 'bg-amber-100 text-amber-900 border-amber-200',
    label: 'URGENCIA MEDIA',
    icon: 'text-amber-600',
  },
  baja: {
    card: 'border-emerald-300 bg-emerald-50/50',
    badge: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    label: 'URGENCIA BAJA',
    icon: 'text-emerald-600',
  },
};

/**
 * PrediccionCard — render de una prediccion de reposicion.
 *
 * Layout:
 * - Header con icono + badge de urgencia color-coded
 * - Nombre del producto + EAN-13
 * - Metricas (stock, dias, consumo, sugerencia)
 * - Razonamiento de la IA en formato de cita
 *
 * Decision UX: el razonamiento de la IA va con comillas y estilo italic
 * para dejar claro que es texto generado, no metricas duras. Esto baja
 * la expectativa de "verdad absoluta" y deja al dueno decidir.
 */
export function PrediccionCard({ prediccion }: Props) {
  const urgencia = normalizarUrgencia(prediccion.urgencia);
  const style = URGENCIA_STYLE[urgencia];

  return (
    <Card className={cn('overflow-hidden border-2', style.card)}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className={cn('h-4 w-4', style.icon)} />
          <Badge variant="outline" className={cn('text-xs font-semibold', style.badge)}>
            {style.label}
          </Badge>
        </div>

        <div>
          <h3 className="text-base font-semibold leading-tight">
            {prediccion.nombre}
          </h3>
          <p className="text-xs text-muted-foreground">EAN: {prediccion.ean13}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <Package className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Stock actual</p>
              <p className="font-semibold tabular-nums">{prediccion.stockActual}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Se agota en</p>
              <p className="font-semibold tabular-nums">
                ~{prediccion.diasHastaAgotamiento} dias
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Consumo</p>
              <p className="font-semibold tabular-nums">
                {prediccion.consumoPromedioDiario.toFixed(1)} u/dia
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Package className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Reponer</p>
              <p className="font-semibold tabular-nums text-primary">
                {prediccion.cantidadSugeridaReponer} u
              </p>
            </div>
          </div>
        </div>

        {prediccion.razonamiento && (
          <blockquote className="border-l-2 border-muted-foreground/30 pl-3 text-sm italic text-muted-foreground">
            {prediccion.razonamiento}
          </blockquote>
        )}
      </CardContent>
    </Card>
  );
}
