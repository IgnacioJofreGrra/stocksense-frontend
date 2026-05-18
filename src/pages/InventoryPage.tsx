import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Settings2, TrendingUp } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StockBadge } from '@/components/products/StockBadge';
import {
  StockMovementType,
  useMovimientosProductoQuery,
  useProductosMasVendidosQuery,
  useProductosQuery,
} from '@/generated/graphql';

type FiltroStock = 'todos' | 'sin-stock' | 'bajo-stock' | 'ok';

export function InventoryPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inventario</h1>
        <p className="text-sm text-muted-foreground">
          Resumen de stock, historial de movimientos y rotacion
        </p>
      </div>

      <Tabs defaultValue="stock">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stock">Stock</TabsTrigger>
          <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
          <TabsTrigger value="rotacion">Rotacion</TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="mt-4">
          <ResumenStock />
        </TabsContent>

        <TabsContent value="movimientos" className="mt-4">
          <HistorialMovimientos />
        </TabsContent>

        <TabsContent value="rotacion" className="mt-4">
          <Rotacion />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ResumenStock() {
  const [filtro, setFiltro] = useState<FiltroStock>('todos');
  const [busqueda, setBusqueda] = useState('');
  const { data, loading } = useProductosQuery({
    variables: { query: { page: 1, limit: 100, search: busqueda || undefined } },
    fetchPolicy: 'cache-and-network',
  });

  const productos = useMemo(() => {
    const lista = data?.productos.data ?? [];
    return lista.filter((p) => {
      const stock = p.stockActual ?? 0;
      switch (filtro) {
        case 'sin-stock':
          return stock <= 0;
        case 'bajo-stock':
          return stock > 0 && stock <= p.stockMinimo;
        case 'ok':
          return stock > p.stockMinimo;
        case 'todos':
        default:
          return true;
      }
    });
  }, [data, filtro]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1"
        />
        <Select value={filtro} onValueChange={(v) => setFiltro(v as FiltroStock)}>
          <SelectTrigger className="sm:w-48">
            <Settings2 className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="sin-stock">Sin stock</SelectItem>
            <SelectItem value="bajo-stock">Bajo minimo</SelectItem>
            <SelectItem value="ok">OK</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && productos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : productos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin productos con esos filtros.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {productos.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.nombre}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    EAN {p.ean13}
                  </p>
                  {p.categoria && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {p.categoria}
                    </Badge>
                  )}
                </div>
                <StockBadge
                  stockActual={p.stockActual ?? 0}
                  stockMinimo={p.stockMinimo}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

const PAGE_SIZE_MOVS = 20;

function HistorialMovimientos() {
  const [productoId, setProductoId] = useState<string>('');
  const [tipoFiltro, setTipoFiltro] = useState<StockMovementType | 'TODOS'>('TODOS');
  const [page, setPage] = useState(1);

  const { data: productosData } = useProductosQuery({
    variables: { query: { page: 1, limit: 100 } },
  });
  const productos = productosData?.productos.data ?? [];

  const { data, loading } = useMovimientosProductoQuery({
    variables: {
      productId: productoId,
      query: {
        page,
        limit: PAGE_SIZE_MOVS,
        tipo: tipoFiltro === 'TODOS' ? undefined : tipoFiltro,
      },
    },
    skip: !productoId,
    fetchPolicy: 'cache-and-network',
  });

  const movimientos = data?.movimientosProducto.data ?? [];
  const lastPage = data?.movimientosProducto.lastPage ?? 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Select
          value={productoId}
          onValueChange={(v) => {
            setProductoId(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Selecciona un producto..." />
          </SelectTrigger>
          <SelectContent>
            {productos.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nombre} ({p.ean13})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={tipoFiltro}
          onValueChange={(v) => {
            setTipoFiltro(v as StockMovementType | 'TODOS');
            setPage(1);
          }}
        >
          <SelectTrigger className="sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos los tipos</SelectItem>
            <SelectItem value={StockMovementType.Entrada}>Entradas</SelectItem>
            <SelectItem value={StockMovementType.Salida}>Salidas</SelectItem>
            <SelectItem value={StockMovementType.Ajuste}>Ajustes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!productoId ? (
        <p className="text-sm text-muted-foreground">
          Selecciona un producto para ver su historial.
        </p>
      ) : loading && movimientos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : movimientos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin movimientos para este producto.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead className="hidden md:table-cell">Motivo</TableHead>
                  <TableHead className="hidden md:table-cell">Nota</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimientos.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-xs">
                      {new Date(m.createdAt as string).toLocaleString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>
                      <TipoBadge tipo={m.tipo} />
                    </TableCell>
                    <TableCell
                      className={
                        m.tipo === StockMovementType.Salida
                          ? 'font-semibold text-red-600'
                          : 'font-semibold text-emerald-600'
                      }
                    >
                      {m.tipo === StockMovementType.Salida ? '-' : '+'}
                      {Math.abs(m.cantidad)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{m.motivo ?? '—'}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {m.nota ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {lastPage > 1 && (
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="text-sm underline-offset-4 hover:underline disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm text-muted-foreground">
                Pagina {page} de {lastPage}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={page >= lastPage || loading}
                className="text-sm underline-offset-4 hover:underline disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TipoBadge({ tipo }: { tipo: StockMovementType }) {
  if (tipo === StockMovementType.Entrada) {
    return (
      <Badge variant="secondary" className="gap-1 bg-emerald-100 text-emerald-900">
        <ArrowUp className="h-3 w-3" />
        Entrada
      </Badge>
    );
  }
  if (tipo === StockMovementType.Salida) {
    return (
      <Badge variant="secondary" className="gap-1 bg-red-100 text-red-900">
        <ArrowDown className="h-3 w-3" />
        Salida
      </Badge>
    );
  }
  return <Badge variant="secondary">Ajuste</Badge>;
}

function Rotacion() {
  const { data, loading } = useProductosMasVendidosQuery({
    variables: { opciones: { limite: 10 } },
    fetchPolicy: 'cache-and-network',
  });

  const chartData = (data?.productosMasVendidos ?? []).map((p) => ({
    nombre: p.nombreProducto.length > 18 ? p.nombreProducto.slice(0, 17) + '...' : p.nombreProducto,
    nombreCompleto: p.nombreProducto,
    totalVendido: p.totalVendido,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5" />
          Top 10 productos vendidos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando rotacion...</p>
        ) : chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aun no hay ventas registradas. Una vez que registres salidas, las veras aqui.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="nombre"
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={70}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  fontSize: '12px',
                }}
                labelFormatter={(_label, items) => {
                  const item = items?.[0]?.payload as { nombreCompleto?: string } | undefined;
                  return item?.nombreCompleto ?? '';
                }}
                formatter={(value) => [`${String(value)} unidades`, 'Vendido']}
              />
              <Bar dataKey="totalVendido" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
