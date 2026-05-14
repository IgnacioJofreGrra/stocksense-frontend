import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Camera,
  CameraOff,
  Keyboard,
  Plus,
  ScanLine,
  XCircle,
} from 'lucide-react';
import { BarcodeFormat, DecodeHintType, NotFoundException } from '@zxing/library';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { QuickEntryDialog } from '@/components/inventory/QuickEntryDialog';
import { QuickSaleDialog } from '@/components/inventory/QuickSaleDialog';
import { ProductFormModal } from '@/components/products/ProductFormModal';
import { StockBadge } from '@/components/products/StockBadge';
import {
  type ProductoFullFragment,
  useProductoPorEanLazyQuery,
} from '@/generated/graphql';
import { isValidEan13 } from '@/utils/ean13';

/**
 * ScannerPage — feature estrella.
 *
 * Configuracion del lector ZXing:
 * - Hints: solo EAN_13. Ignorar otros formatos acelera la deteccion y
 *   evita falsos positivos con QR/Code128 que no nos sirven.
 * - facingMode environment: camara trasera por default (la del celular
 *   apuntando a la espalda, para escanear cosas fisicas).
 *
 * Flujo continuo: tras una accion (entrada/venta/registro), volvemos al
 * modo "buscando" sin rebooteo del stream — solo limpiamos el estado del
 * producto encontrado.
 */
// Agregar tipo para la sugerencia de OFF
interface SugerenciaOff {
  nombre?: string | null;
  marca?: string | null;
  categoria?: string | null;
  imagenUrl?: string | null;
}

type Estado =
  | { kind: 'idle' }
  | { kind: 'searching'; ean13: string }
  | { kind: 'found'; producto: ProductoFullFragment }
  | { kind: 'not-found'; ean13: string; sugerencia: SugerenciaOff | null } // ← agregar sugerencia
  | { kind: 'invalid'; codigo: string }
  | { kind: 'error'; message: string };

const SCAN_COOLDOWN_MS = 2500;

export function ScannerPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const lastScanAtRef = useRef<number>(0);

  const [estado, setEstado] = useState<Estado>({ kind: 'idle' });
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualEan, setManualEan] = useState('');
  const [showEntrada, setShowEntrada] = useState(false);
  const [showSalida, setShowSalida] = useState(false);
  const [showCrear, setShowCrear] = useState(false);

  const [buscarProducto] = useProductoPorEanLazyQuery({
    fetchPolicy: 'network-only',
  });

  /**
   * Procesa un EAN-13 detectado (camara o input manual).
   * Centralizado aca para que ambos paths usen la misma logica.
   */
  const procesarEan = useCallback(
    async (codigo: string) => {
      const limpio = codigo.replace(/\D/g, '');
      if (!isValidEan13(limpio)) {
        setEstado({ kind: 'invalid', codigo });
        toast.error('Codigo invalido o no es EAN-13');
        return;
      }
      if ('vibrate' in navigator) navigator.vibrate(100);

      setEstado({ kind: 'searching', ean13: limpio });
      try {
        const { data } = await buscarProducto({ variables: { ean13: limpio } });
        const resultado = data?.productoPorEan;

        if (resultado?.fuente === 'local' && resultado.producto) {
          setEstado({ kind: 'found', producto: resultado.producto });
        } else {
          // fuente: 'off' o 'desconocido' — en ambos casos mostramos el form
          setEstado({
            kind: 'not-found',
            ean13: limpio,
            sugerencia: resultado?.sugerenciaOff ?? null,
          });
        }
      } catch (err) {
        setEstado({
          kind: 'error',
          message: err instanceof Error ? err.message : 'Error al buscar producto',
        });
      }
    },
    [buscarProducto],
  );

  /**
   * Inicializa la camara y empieza a escuchar decodes.
   * Cleanup al desmontar para liberar el stream.
   */
  useEffect(() => {
    const hints = new Map<DecodeHintType, unknown>();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]);
    hints.set(DecodeHintType.TRY_HARDER, true);

    const reader = new BrowserMultiFormatReader(hints);
    readerRef.current = reader;
    // Capturamos el video element en una var local para que el cleanup
    // tenga acceso garantizado al mismo node que estamos usando ahora
    // (la regla react-hooks/exhaustive-deps avisa que videoRef.current
    // puede haber cambiado al momento de cleanup; con esta variable no).
    const videoEl = videoRef.current;

    let stopped = false;
    const start = async () => {
      try {
        if (!videoEl) return;
        await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' } } },
          videoEl,
          (result, err) => {
            if (stopped) return;
            if (result) {
              const text = result.getText();
              const now = Date.now();
              // Cooldown: ignoramos detecciones repetidas en el mismo
              // gap. Sin esto, el reader dispara 30+ veces por segundo.
              if (now - lastScanAtRef.current < SCAN_COOLDOWN_MS) return;
              lastScanAtRef.current = now;
              void procesarEan(text);
            }
            // NotFoundException es esperado en cada frame que no tiene un
            // codigo: lo ignoramos. Otros errores los logueamos.
            if (err && !(err instanceof NotFoundException)) {
              console.warn('[scanner] decode error', err.message);
            }
          },
        );
        setCameraReady(true);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        setCameraError(msg);
        setCameraReady(false);
      }
    };

    void start();

    return () => {
      stopped = true;
      // Stop tracks del MediaStream para liberar la camara. Usamos la
      // variable capturada al efecto para no leer el ref en cleanup.
      const stream = videoEl?.srcObject;
      if (stream && stream instanceof MediaStream) {
        stream.getTracks().forEach((t) => t.stop());
        if (videoEl) videoEl.srcObject = null;
      }
      readerRef.current = null;
    };
  }, [procesarEan]);

  const volverAEscanear = () => {
    setEstado({ kind: 'idle' });
    setManualEan('');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEan) return;
    void procesarEan(manualEan);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <ScanLine className="h-6 w-6" />
          Escanear producto
        </h1>
        <p className="text-sm text-muted-foreground">
          Apunta al codigo de barras EAN-13. La deteccion es automatica.
        </p>
      </div>

      {/* Visor de camara */}
      <Card className="overflow-hidden">
        <div className="relative bg-black">
          <video
            ref={videoRef}
            className="aspect-[4/3] w-full object-cover md:aspect-video"
            playsInline
            muted
          />
          {/* Overlay: marco de guia */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-32 w-3/4 max-w-md rounded-lg border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
          </div>
          {/* Estado */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
            {!cameraReady && !cameraError && (
              <Badge variant="secondary" className="gap-2">
                <Camera className="h-3 w-3" />
                Iniciando camara...
              </Badge>
            )}
            {cameraReady && estado.kind === 'idle' && (
              <Badge variant="secondary" className="gap-2 bg-white/90 text-black">
                <ScanLine className="h-3 w-3 animate-pulse" />
                Buscando codigo...
              </Badge>
            )}
            {estado.kind === 'searching' && (
              <Badge className="gap-2">Procesando {estado.ean13}...</Badge>
            )}
            {cameraError && (
              <Badge variant="destructive" className="gap-2">
                <CameraOff className="h-3 w-3" />
                Camara no disponible
              </Badge>
            )}
          </div>
        </div>

        {/* Fallback manual: siempre visible. Critico cuando no hay camara
            o el codigo esta dañado. */}
        <CardContent className="border-t pt-4">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Keyboard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="O escribi el codigo (13 digitos)"
                value={manualEan}
                onChange={(e) => setManualEan(e.target.value.replace(/\D/g, ''))}
                maxLength={13}
                inputMode="numeric"
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={manualEan.length !== 13}>
              Buscar
            </Button>
          </form>
          {cameraError && (
            <p className="mt-2 text-xs text-muted-foreground">
              {cameraError.includes('Permission')
                ? 'Sin permiso de camara. Habilitalo en la configuracion del navegador.'
                : `Detalle: ${cameraError}`}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Resultado del scan */}
      {estado.kind === 'found' && (
        <ResultadoEncontrado
          producto={estado.producto}
          onEntrada={() => setShowEntrada(true)}
          onSalida={() => setShowSalida(true)}
          onContinuar={volverAEscanear}
        />
      )}

      {estado.kind === 'not-found' && (
        <ResultadoNoEncontrado
          ean13={estado.ean13}
          sugerencia={estado.sugerencia}
          onCrear={() => setShowCrear(true)}
          onContinuar={volverAEscanear}
        />
      )}

      {estado.kind === 'invalid' && (
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <XCircle className="h-5 w-5 text-destructive" />
            <div className="flex-1">
              <p className="font-medium">Codigo no compatible</p>
              <p className="text-sm text-muted-foreground">
                StockSense usa codigos de barras EAN-13. {estado.codigo} no es valido.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={volverAEscanear}>
              OK
            </Button>
          </CardContent>
        </Card>
      )}

      {estado.kind === 'error' && (
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <XCircle className="h-5 w-5 text-destructive" />
            <p className="flex-1 text-sm">{estado.message}</p>
            <Button variant="outline" size="sm" onClick={volverAEscanear}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      {estado.kind === 'found' && (
        <>
          <QuickEntryDialog
            open={showEntrada}
            onOpenChange={setShowEntrada}
            producto={estado.producto}
            onRegistrado={volverAEscanear}
          />
          <QuickSaleDialog
            open={showSalida}
            onOpenChange={setShowSalida}
            producto={estado.producto}
            onRegistrado={volverAEscanear}
          />
        </>
      )}

      {estado.kind === 'not-found' && (
        <ProductFormModal
          open={showCrear}
          onOpenChange={setShowCrear}
          ean13Inicial={estado.ean13}
          sugerenciaOff={estado.sugerencia}  // ← nuevo prop
          onSuccess={(p) => setEstado({ kind: 'found', producto: p })}
        />
      )}
    </div>
  );
}

function ResultadoEncontrado({
  producto,
  onEntrada,
  onSalida,
  onContinuar,
}: {
  producto: ProductoFullFragment;
  onEntrada: () => void;
  onSalida: () => void;
  onContinuar: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3">
          <span>{producto.nombre}</span>
          <StockBadge
            stockActual={producto.stockActual ?? 0}
            stockMinimo={producto.stockMinimo}
          />
        </CardTitle>
        <p className="font-mono text-xs text-muted-foreground">EAN {producto.ean13}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {producto.precioVenta != null && (
          <p className="text-sm">
            Precio venta:{' '}
            <span className="font-semibold">${producto.precioVenta.toFixed(2)}</span>
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={onEntrada} className="h-12 gap-2 bg-emerald-600 hover:bg-emerald-700">
            <ArrowUpRight className="h-5 w-5" />
            Entrada
          </Button>
          <Button onClick={onSalida} className="h-12 gap-2 bg-red-600 hover:bg-red-700">
            <ArrowDownRight className="h-5 w-5" />
            Venta
          </Button>
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={onContinuar}>
          Cancelar y seguir escaneando
        </Button>
      </CardContent>
    </Card>
  );
}

function ResultadoNoEncontrado({
  ean13,
  sugerencia,
  onCrear,
  onContinuar,
}: {
  ean13: string;
  sugerencia: SugerenciaOff | null;
  onCrear: () => void;
  onContinuar: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Producto no registrado</CardTitle>
        <p className="font-mono text-xs text-muted-foreground">EAN {ean13}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Si OFF encontró datos, mostrarlos como preview */}
        {sugerencia ? (
          <div className="rounded-md bg-muted p-3 text-sm space-y-1">
            <p className="font-medium text-foreground">
              {sugerencia.nombre ?? 'Nombre no disponible'}
            </p>
            {sugerencia.marca && (
              <p className="text-muted-foreground">Marca: {sugerencia.marca}</p>
            )}
            <p className="text-xs text-blue-600">
              Datos sugeridos por Open Food Facts — podés editarlos antes de guardar
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Este codigo todavia no esta en tu catalogo. Podes registrarlo ahora.
          </p>
        )}

        <Button onClick={onCrear} className="w-full gap-2">
          <Plus className="h-4 w-4" />
          {sugerencia ? 'Registrar con estos datos' : 'Registrar nuevo producto'}
        </Button>
        <Button variant="outline" size="sm" className="w-full" onClick={onContinuar}>
          Saltar y seguir escaneando
        </Button>
      </CardContent>
    </Card>
  );
}
