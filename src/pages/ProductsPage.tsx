import { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Eye,
  EyeOff,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { QuickEntryDialog } from '@/components/inventory/QuickEntryDialog';
import { QuickSaleDialog } from '@/components/inventory/QuickSaleDialog';
import { ProductFormModal } from '@/components/products/ProductFormModal';
import { StockBadge } from '@/components/products/StockBadge';
import {
  type ProductoFullFragment,
  useActualizarProductoMutation,
  useDesactivarProductoMutation,
  useProductosQuery,
} from '@/generated/graphql';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

const PAGE_SIZE = 20;

export function ProductsPage() {
  const { user } = useAuthStore();
  const esDueno = user?.rol === 'dueno';
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [verDesactivados, setVerDesactivados] = useState(false);
  const [productoEditando, setProductoEditando] = useState<ProductoFullFragment | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEntrada, setProductoEntrada] = useState<ProductoFullFragment | null>(null);
  const [productoSalida, setProductoSalida] = useState<ProductoFullFragment | null>(null);
  const [productoEliminar, setProductoEliminar] = useState<ProductoFullFragment | null>(null);

  const { data, loading, refetch } = useProductosQuery({
    variables: {
      query: {
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        activo: !verDesactivados,
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  const [desactivarProducto] = useDesactivarProductoMutation();
  const [actualizarProducto] = useActualizarProductoMutation();

  const productos = data?.productos.data ?? [];
  const total = data?.productos.total ?? 0;
  const lastPage = data?.productos.lastPage ?? 1;

  const abrirNuevo = () => {
    setProductoEditando(null);
    setModalAbierto(true);
  };

  const abrirEdit = (p: ProductoFullFragment) => {
    setProductoEditando(p);
    setModalAbierto(true);
  };

  const handleDesactivar = async () => {
    if (!productoEliminar) return;
    try {
      await desactivarProducto({ variables: { id: productoEliminar.id } });
      toast.success(`"${productoEliminar.nombre}" desactivado`);
      setProductoEliminar(null);
      void refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al desactivar');
    }
  };

  const handleReactivar = (p: ProductoFullFragment) => {
    // TODO: reconectar al mutation real (backend ya acepta activo:true)
    toast.info(`Reactivacion de "${p.nombre}" estara disponible proximamente`);
    void actualizarProducto;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="text-sm text-muted-foreground">
            {total === 0 ? 'Sin productos cargados' : `${total} producto(s) en catalogo`}
          </p>
        </div>
        {esDueno && (
          <Button onClick={abrirNuevo} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo producto
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o descripcion..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Button
              variant={verDesactivados ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setVerDesactivados((v) => !v);
                setPage(1);
              }}
              className="gap-2"
              title={verDesactivados ? 'Volver a activos' : 'Ver productos desactivados'}
            >
              {verDesactivados ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {verDesactivados ? 'Activos' : 'Desactivados'}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>EAN-13</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden md:table-cell">Categoria</TableHead>
                  <TableHead className="hidden md:table-cell">Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && productos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : productos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <EmptyProductos
                        search={search}
                        verDesactivados={verDesactivados}
                        onCrear={esDueno ? abrirNuevo : undefined}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  productos.map((p) => (
                    <TableRow key={p.id} className={cn(!p.activo && 'opacity-60')}>
                      <TableCell className="font-mono text-xs">{p.ean13}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {p.nombre}
                          {!p.activo && (
                            <Badge variant="secondary" className="text-xs">
                              Desactivado
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {p.categoria ? (
                          <Badge variant="outline">{p.categoria}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {p.precioVenta != null ? `$${p.precioVenta.toFixed(2)}` : '—'}
                      </TableCell>
                      <TableCell>
                        <StockBadge
                          stockActual={p.stockActual ?? 0}
                          stockMinimo={p.stockMinimo}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {p.activo ? (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setProductoEntrada(p)}
                                title="Entrada rapida"
                              >
                                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setProductoSalida(p)}
                                title="Venta rapida"
                              >
                                <ArrowDownRight className="h-4 w-4 text-red-600" />
                              </Button>
                              {esDueno && (
                                <>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => abrirEdit(p)}
                                    title="Editar"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setProductoEliminar(p)}
                                    title="Desactivar"
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </>
                              )}
                            </>
                          ) : (
                            esDueno && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReactivar(p)}
                                className="gap-1"
                                title="Reactivar"
                              >
                                <RotateCcw className="h-3 w-3" />
                                Reactivar
                              </Button>
                            )
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {lastPage > 1 && (
            <div className="mt-4 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Pagina {page} de {lastPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={page >= lastPage || loading}
              >
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ProductFormModal
        open={modalAbierto}
        onOpenChange={setModalAbierto}
        producto={productoEditando}
        onSuccess={() => void refetch()}
      />

      {productoEntrada && (
        <QuickEntryDialog
          open={!!productoEntrada}
          onOpenChange={(open) => !open && setProductoEntrada(null)}
          producto={productoEntrada}
          onRegistrado={() => void refetch()}
        />
      )}

      {productoSalida && (
        <QuickSaleDialog
          open={!!productoSalida}
          onOpenChange={(open) => !open && setProductoSalida(null)}
          producto={productoSalida}
          onRegistrado={() => void refetch()}
        />
      )}

      <Dialog
        open={!!productoEliminar}
        onOpenChange={(open) => !open && setProductoEliminar(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Desactivar producto</DialogTitle>
            <DialogDescription>
              <strong>{productoEliminar?.nombre}</strong> dejara de aparecer en busquedas,
              alertas y al escanear su codigo. El historial de movimientos se conserva.
              Podes reactivarlo despues desde la papelera.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setProductoEliminar(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => void handleDesactivar()}>
              Desactivar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface EmptyProps {
  search: string;
  verDesactivados: boolean;
  onCrear?: () => void;
}

function EmptyProductos({ search, verDesactivados, onCrear }: EmptyProps) {
  if (search) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
        <Search className="h-8 w-8 opacity-50" />
        <p className="text-sm">Sin resultados para "{search}"</p>
      </div>
    );
  }
  if (verDesactivados) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
        <EyeOff className="h-8 w-8 opacity-50" />
        <p className="text-sm">No tenes productos desactivados</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <Package className="h-10 w-10 text-muted-foreground/50" />
      <div>
        <p className="font-medium">Aun no tenes productos cargados</p>
        <p className="text-sm text-muted-foreground">
          Empeza creando uno o escanealo desde la camara.
        </p>
      </div>
      {onCrear && (
        <Button onClick={onCrear} className="gap-2">
          <Plus className="h-4 w-4" />
          Agregar producto
        </Button>
      )}
    </div>
  );
}
