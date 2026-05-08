import { useState, type FormEvent } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { StockMovementType, useRegistrarEntradaMutation } from '@/generated/graphql';

interface ProductoMin {
  id: string;
  ean13: string;
  nombre: string;
  stockActual?: number | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  producto: ProductoMin;
  /** Llamado al exito; el caller decide que hacer (refetch, volver al scanner). */
  onRegistrado?: (stockActual: number) => void;
}

const MOTIVOS = ['compra', 'devolucion', 'inventario inicial', 'otro'];

/**
 * QuickEntryDialog — registrar entrada rapida.
 *
 * Mismo patron que QuickSaleDialog. Cantidad default 1 (escenario tipico
 * en mostrador).
 */
export function QuickEntryDialog({ open, onOpenChange, producto, onRegistrado }: Props) {
  const [cantidad, setCantidad] = useState('1');
  const [motivo, setMotivo] = useState<string>('compra');
  const [nota, setNota] = useState('');
  const [registrar, { loading }] = useRegistrarEntradaMutation();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cantidadNum = Number(cantidad);
    if (!Number.isInteger(cantidadNum) || cantidadNum < 1) {
      toast.error('La cantidad debe ser un entero positivo');
      return;
    }
    try {
      // Optimistic UI: Apollo aplica esta respuesta al cache inmediatamente
      // y la revierte si el server falla. Para entradas siempre es seguro
      // (sumar stock no genera errores de validacion). El __typename y el
      // id del Product le permiten a Apollo hacer match en el cache y
      // actualizar el stockActual en cualquier query que lo tenga.
      const stockOptimista =
        producto.stockActual != null ? producto.stockActual + cantidadNum : 0;

      const { data } = await registrar({
        variables: {
          input: {
            productId: producto.id,
            cantidad: cantidadNum,
            motivo: motivo || undefined,
            nota: nota || undefined,
          },
        },
        optimisticResponse: {
          registrarEntrada: {
            __typename: 'MovimientoConStock',
            movimiento: {
              __typename: 'StockMovement',
              id: `temp-${Date.now()}`,
              tipo: StockMovementType.Entrada,
              cantidad: cantidadNum,
              motivo: motivo || 'compra',
              nota: nota || null,
              productId: producto.id,
              createdAt: new Date().toISOString(),
            },
            stockActual: stockOptimista,
          },
        },
        update: (cache, { data: result }) => {
          // Refrescamos el campo stockActual del Product en cache. Asi la
          // tabla y cualquier vista que lo tenga se actualizan al toque.
          if (!result) return;
          cache.modify({
            id: cache.identify({ __typename: 'Product', id: producto.id }),
            fields: {
              stockActual: () => result.registrarEntrada.stockActual,
            },
          });
        },
      });
      const nuevoStock = data?.registrarEntrada.stockActual ?? 0;
      toast.success(
        `+${cantidadNum} ${producto.nombre}. Stock: ${nuevoStock}`,
      );
      onRegistrado?.(nuevoStock);
      onOpenChange(false);
      // Reset para la proxima vez que se abra el dialog.
      setCantidad('1');
      setMotivo('compra');
      setNota('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al registrar entrada');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-emerald-600" />
            Registrar entrada
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 rounded-md bg-muted p-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Producto</p>
            <p className="font-medium">{producto.nombre}</p>
            <p className="text-xs text-muted-foreground">EAN {producto.ean13}</p>
          </div>
          {producto.stockActual !== undefined && producto.stockActual !== null && (
            <p className="text-sm">
              Stock actual: <span className="font-semibold">{producto.stockActual}</span>
            </p>
          )}
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cantidad-entrada">Cantidad *</Label>
            <Input
              id="cantidad-entrada"
              type="number"
              min="1"
              step="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo-entrada">Motivo</Label>
            <Select value={motivo} onValueChange={setMotivo}>
              <SelectTrigger id="motivo-entrada">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOTIVOS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nota-entrada">Nota (opcional)</Label>
            <Textarea
              id="nota-entrada"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              maxLength={500}
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar entrada'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
