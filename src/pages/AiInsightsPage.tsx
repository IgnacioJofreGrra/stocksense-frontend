import { useState } from 'react';
import { Brain, ShoppingCart, Sparkles, TrendingUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrdenCompraTab } from '@/components/ai/OrdenCompraTab';
import { PrediccionesTab } from '@/components/ai/PrediccionesTab';
import { TendenciasTab } from '@/components/ai/TendenciasTab';

type AiTab = 'predicciones' | 'tendencias' | 'orden';

const TAB_DEFS: ReadonlyArray<{
  value: AiTab;
  label: string;
  icon: typeof Sparkles;
}> = [
  { value: 'predicciones', label: 'Predicciones', icon: Sparkles },
  { value: 'tendencias', label: 'Tendencias', icon: TrendingUp },
  { value: 'orden', label: 'Orden de compra', icon: ShoppingCart },
];

/**
 * AiInsightsPage — pagina /inteligencia.
 *
 * Estructura:
 * - Header con titulo + descripcion del modulo
 * - Selector de tab: Tabs estandar de shadcn en md+, dropdown en mobile
 *   (porque 3 botones grandes ocupan toda la pantalla del celular)
 * - Cada tab contiene su propio fetch lazy + UX (loading/error/empty)
 *
 * Decisiones:
 * - Cada tab carga datos solo cuando el usuario aprieta "Analizar". Esto
 *   evita que abrir la pagina dispare 3 queries de IA (rate limit + costos).
 * - Las tabs son independientes — entrar a Tendencias y volver a
 *   Predicciones NO refetcha (los hooks lazy mantienen su data).
 */
export function AiInsightsPage() {
  const [activeTab, setActiveTab] = useState<AiTab>('predicciones');

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Brain className="mt-1 h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Inteligencia del negocio
          </h1>
          <p className="text-sm text-muted-foreground">
            Predicciones, patrones de venta y orden de compra sugerida —
            generadas por IA en base a tus movimientos.
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as AiTab)}
        className="space-y-4"
      >
        {/* Mobile: dropdown selector. Desktop: tabs horizontales. */}
        <div className="md:hidden">
          <Select value={activeTab} onValueChange={(v) => setActiveTab(v as AiTab)}>
            <SelectTrigger className="w-full" aria-label="Seleccionar tab de inteligencia">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TAB_DEFS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  <span className="flex items-center gap-2">
                    <t.icon className="h-4 w-4" />
                    {t.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TabsList className="hidden w-full md:grid md:grid-cols-3">
          {TAB_DEFS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="gap-2">
              <t.icon className="h-4 w-4" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="predicciones">
          <PrediccionesTab />
        </TabsContent>
        <TabsContent value="tendencias">
          <TendenciasTab />
        </TabsContent>
        <TabsContent value="orden">
          <OrdenCompraTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
