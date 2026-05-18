import { useState, type FormEvent } from 'react';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  type ProductoFullFragment,
  ProductosDocument,
  useActualizarProductoMutation,
  useCrearProductoMutation,
} from '@/generated/graphql';
import { cn } from '@/lib/utils';
import { validateEan13 } from '@/utils/ean13';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** si viene, edita; si no, crea */
  producto?: ProductoFullFragment | null;
  ean13Inicial?: string;
  sugerenciaOff?: {
    nombre?: string | null;
    marca?: string | null;
    categoria?: string | null;
    imagenUrl?: string | null;
  } | null;
  onSuccess?: (producto: ProductoFullFragment) => void;
}

interface FormState {
  ean13: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precioCompra: string;
  precioVenta: string;
  unidadMedida: string;
  stockMinimo: string;
  imagenUrl: string;
}

const EMPTY: FormState = {
  ean13: '',
  nombre: '',
  descripcion: '',
  categoria: '',
  precioCompra: '',
  precioVenta: '',
  unidadMedida: 'unidad',
  stockMinimo: '5',
  imagenUrl: '',
};

function buildInitial(
  producto: ProductoFullFragment | null | undefined,
  ean13Inicial: string | undefined,
  sugerenciaOff:
    | {
        nombre?: string | null;
        marca?: string | null;
        categoria?: string | null;
        imagenUrl?: string | null;
      }
    | null
    | undefined,
): FormState {
  if (producto) {
    return {
      ean13: producto.ean13,
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? '',
      categoria: producto.categoria ?? '',
      precioCompra: producto.precioCompra?.toString() ?? '',
      precioVenta: producto.precioVenta?.toString() ?? '',
      unidadMedida: producto.unidadMedida,
      stockMinimo: producto.stockMinimo.toString(),
      imagenUrl: producto.imagenUrl ?? '',
    };
  }

  return {
    ...EMPTY,
    ean13: ean13Inicial ?? '',
    nombre: sugerenciaOff?.nombre ?? '',
    descripcion: sugerenciaOff?.marca ?? '',
    categoria: sugerenciaOff?.categoria ?? '',
    imagenUrl: sugerenciaOff?.imagenUrl ?? '',
  };
}

export function ProductFormModal({
  open,
  onOpenChange,
  producto,
  ean13Inicial,
  sugerenciaOff,
  onSuccess,
}: Props) {
  // el key fuerza remount de FormBody para reinicializar el state desde props
  const formKey = `${producto?.id ?? 'new'}-${ean13Inicial ?? ''}-${open ? 'open' : 'closed'}`;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{producto ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
          <DialogDescription>
            {producto
              ? 'Actualiza los datos del producto. El stock se modifica desde Inventario.'
              : 'Completa los datos. Despues podras registrar entradas y ventas.'}
          </DialogDescription>
        </DialogHeader>

        <FormBody
          key={formKey}
          producto={producto ?? null}
          ean13Inicial={ean13Inicial}
          sugerenciaOff={sugerenciaOff ?? null}
          onCancel={() => onOpenChange(false)}
          onSuccess={(p) => {
            onSuccess?.(p);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

interface FormBodyProps {
  producto: ProductoFullFragment | null;
  ean13Inicial?: string;
  sugerenciaOff?: {
    nombre?: string | null;
    marca?: string | null;
    categoria?: string | null;
    imagenUrl?: string | null;
  } | null;
  onCancel: () => void;
  onSuccess: (p: ProductoFullFragment) => void;
}

function FormBody({ producto, ean13Inicial, sugerenciaOff, onCancel, onSuccess }: FormBodyProps) {
  const isEdit = !!producto;
  const [form, setForm] = useState<FormState>(() =>
    buildInitial(producto, ean13Inicial, sugerenciaOff),
  );

  const ean13State = validateEan13(form.ean13);
  const ean13Valido = ean13State.kind === 'valid';

  const [crearProducto, { loading: creating }] = useCrearProductoMutation({
    refetchQueries: [{ query: ProductosDocument, variables: { query: { page: 1, limit: 20 } } }],
  });
  const [actualizarProducto, { loading: updating }] = useActualizarProductoMutation();

  const loading = creating || updating;

  const update = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!ean13Valido) return;

    const input = {
      ean13: form.ean13,
      nombre: form.nombre,
      descripcion: form.descripcion || undefined,
      categoria: form.categoria || undefined,
      precioCompra: form.precioCompra ? Number(form.precioCompra) : undefined,
      precioVenta: form.precioVenta ? Number(form.precioVenta) : undefined,
      unidadMedida: form.unidadMedida || undefined,
      stockMinimo: form.stockMinimo ? Number(form.stockMinimo) : undefined,
      imagenUrl: form.imagenUrl || undefined,
    };

    try {
      if (isEdit && producto) {
        const { data } = await actualizarProducto({
          variables: { id: producto.id, input },
        });
        if (data?.actualizarProducto) {
          toast.success(`Producto "${data.actualizarProducto.nombre}" actualizado`);
          onSuccess(data.actualizarProducto);
        }
      } else {
        const { data } = await crearProducto({ variables: { input } });
        if (data?.crearProducto) {
          toast.success(`Producto "${data.crearProducto.nombre}" creado`);
          onSuccess(data.crearProducto);
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar producto');
    }
  };

  return (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          {form.imagenUrl && (
            <div className="flex justify-center">
              <img
                src={form.imagenUrl}
                alt={form.nombre || 'Producto'}
                className="h-28 w-28 rounded-md border object-contain"
                onError={(e) => {
                  // ocultar si la URL de OFF esta rota, sin romper el form
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="ean13">EAN-13</Label>
            <div className="relative">
              <Input
                id="ean13"
                value={form.ean13}
                onChange={(e) => update('ean13', e.target.value.replace(/\D/g, ''))}
                placeholder="13 digitos"
                maxLength={13}
                inputMode="numeric"
                required
                disabled={isEdit}
                className={cn(
                  'pr-10',
                  ean13State.kind === 'valid' && 'border-emerald-600',
                  ean13State.kind === 'invalid-checksum' && 'border-destructive',
                )}
              />
              {ean13State.kind === 'valid' && (
                <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
              )}
              {ean13State.kind === 'invalid-checksum' && (
                <X className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />
              )}
            </div>
            <Ean13Hint state={ean13State} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={form.nombre}
              onChange={(e) => update('nombre', e.target.value)}
              required
              minLength={2}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria</Label>
            <Input
              id="categoria"
              value={form.categoria}
              onChange={(e) => update('categoria', e.target.value)}
              maxLength={100}
              placeholder="Bebidas, Almacen, Limpieza..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precioCompra">Precio compra</Label>
              <Input
                id="precioCompra"
                type="number"
                step="0.01"
                min="0"
                value={form.precioCompra}
                onChange={(e) => update('precioCompra', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precioVenta">Precio venta</Label>
              <Input
                id="precioVenta"
                type="number"
                step="0.01"
                min="0"
                value={form.precioVenta}
                onChange={(e) => update('precioVenta', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unidadMedida">Unidad</Label>
              <Select
                value={form.unidadMedida}
                onValueChange={(v) => update('unidadMedida', v)}
              >
                <SelectTrigger id="unidadMedida">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unidad">unidad</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="litro">litro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockMinimo">Stock minimo</Label>
              <Input
                id="stockMinimo"
                type="number"
                min="0"
                value={form.stockMinimo}
                onChange={(e) => update('stockMinimo', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripcion</Label>
            <Textarea
              id="descripcion"
              value={form.descripcion}
              onChange={(e) => update('descripcion', e.target.value)}
              maxLength={2000}
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!ean13Valido || loading}>
              {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
  );
}

function Ean13Hint({ state }: { state: ReturnType<typeof validateEan13> }) {
  switch (state.kind) {
    case 'empty':
      return null;
    case 'incomplete':
      return (
        <p className="text-xs text-muted-foreground">
          Faltan {state.faltantes} digito(s)
        </p>
      );
    case 'invalid-format':
      return <p className="text-xs text-destructive">Solo digitos, exactamente 13</p>;
    case 'invalid-checksum':
      return (
        <p className="text-xs text-destructive">
          Codigo invalido: digito verificador incorrecto
        </p>
      );
    case 'valid':
      return <p className="text-xs text-emerald-600">EAN-13 valido</p>;
  }
}
