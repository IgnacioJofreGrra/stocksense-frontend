import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
  stockActual: number;
  stockMinimo: number;
}

// Semaforo de stock:
//   0          -> "Sin stock", rojo
//   <= minimo  -> bajo stock, rojo
//   <= min*2   -> atencion, amarillo
//   resto      -> ok, verde
// Centralizado para que ProductsPage e InventoryPage no dupliquen umbrales.
export function StockBadge({ stockActual, stockMinimo }: Props) {
  if (stockActual <= 0) {
    return (
      <Badge variant="destructive" className="font-semibold">
        Sin stock
      </Badge>
    );
  }
  if (stockActual <= stockMinimo) {
    return <Badge variant="destructive">{stockActual} / min {stockMinimo}</Badge>;
  }
  const atencion = stockActual <= stockMinimo * 2;
  return (
    <Badge
      variant="secondary"
      className={cn(
        'font-medium',
        atencion ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900',
      )}
    >
      {stockActual}
    </Badge>
  );
}
