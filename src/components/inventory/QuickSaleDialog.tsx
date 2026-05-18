import { useState, type FormEvent } from 'react';
import { ArrowDownRight } from 'lucide-react';
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
import { StockMovementType, useRegistrarSalidaMutation } from '@/generated/graphql';

interface ProductoMin {
  id: string;
  ean13: string;
  nombre: string;
  stockActual?: number | null;
  stockMinimo?: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  producto: ProductoMin;
  onRegistrado?: (stockActual: number) => void;
}

const MOTIVOS = ['venta', 'devolucion proveedor', 'merma', 'otro'];

export function QuickSaleDialog({ open, onOpenChange, producto, onRegistrado }: Props) {
  const [cantidad, setCantidad] = useState('1');
  const [motivo, setMotivo] = useState<string>('venta');
  const [nota, setNota] = useState('');
  const [registrar, { loading }] = useRegistrarSalidaMutation();

  const cantidadNum = Number(cantidad);
  const stockConocido = producto.stockActual ?? null;
  const stockInsuficiente =
    stockConocido !== null && Number.isInteger(cantidadNum) && cantidadNum > stockConocido;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!Number.isInteger(cantidadNum) || cantidadNum < 1) {
      toast.error('La cantidad debe ser un entero positivo');
      return;
    }
    // optimistic solo con margen amplio: cerca del minimo evitamos flash + rollback por race
    const margen =
      stockConocido !== null && producto.stockMinimo !== undefined
        ? stockConocido - cantidadNum - producto.stockMinimo
        : -Infinity;
    const usarOptimistic = margen >= 5;

    try {
      const { data } = await registrar({
        variables: {
          input: {
            productId: producto.id,
            cantidad: cantidadNum,
            motivo: motivo || undefined,
            nota: nota || undefined,
          },
        },
        ...(usarOptimistic && stockConocido !== null
          ? {
              optimisticResponse: {
                registrarSalida: {
                  __typename: 'MovimientoConStock' as const,
                  movimiento: {
                    __typename: 'StockMovement' as const,
                    id: `temp-${Date.now()}`,
                    tipo: StockMovementType.Salida,
                    cantidad: cantidadNum,
                    motivo: motivo || 'venta',
                    nota: nota || null,
                    productId: producto.id,
                    createdAt: new Date().toISOString(),
                  },
                  stockActual: stockConocido - cantidadNum,
                },
              },
            }
          : {}),
        update: (cache, { data: result }) => {
          if (!result) return;
          cache.modify({
            id: cache.identify({ __typename: 'Product', id: producto.id }),
            fields: {
              stockActual: () => result.registrarSalida.stockActual,
            },
          });
        },
      });
      const nuevoStock = data?.registrarSalida.stockActual ?? 0;
      toast.success(`-${cantidadNum} ${producto.nombre}. Stock: ${nuevoStock}`);
      if (producto.stockMinimo !== undefined && nuevoStock <= producto.stockMinimo) {
        toast.warning(
          `${producto.nombre} bajo stock minimo (${nuevoStock}/${producto.stockMinimo})`,
        );
      }
      onRegistrado?.(nuevoStock);
      onOpenChange(false);
      setCantidad('1');
      setMotivo('venta');
      setNota('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al registrar salida');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowDownRight className="h-5 w-5 text-red-600" />
            Registrar venta
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 rounded-md bg-muted p-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Producto</p>
            <p className="font-medium">{producto.nombre}</p>
            <p className="text-xs text-muted-foreground">EAN {producto.ean13}</p>
          </div>
          {stockConocido !== null && (
            <p className="text-sm">
              Stock actual: <span className="font-semibold">{stockConocido}</span>
            </p>
          )}
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cantidad-salida">Cantidad *</Label>
            <Input
              id="cantidad-salida"
              type="number"
              min="1"
              step="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
              autoFocus
            />
            {stockInsuficiente && (
              <p className="text-xs text-destructive">
                Stock insuficiente (disponible: {stockConocido})
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo-salida">Motivo</Label>
            <Select value={motivo} onValueChange={setMotivo}>
              <SelectTrigger id="motivo-salida">
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
            <Label htmlFor="nota-salida">Nota (opcional)</Label>
            <Textarea
              id="nota-salida"
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
            <Button type="submit" disabled={loading || stockInsuficiente}>
              {loading ? 'Registrando...' : 'Registrar venta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
