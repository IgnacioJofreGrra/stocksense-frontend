import { useState, type FormEvent } from 'react';
import { ShieldCheck, User } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/authStore';

// Datos del usuario y cambio de password. La UI esta completa; los
// handlers todavia no llaman al PATCH real — muestran un toast hasta que
// reconectemos los endpoints recientes.
export function ProfilePage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="text-sm text-muted-foreground">No hay datos del usuario.</div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mi perfil</h1>
        <p className="text-sm text-muted-foreground">Datos de cuenta y seguridad</p>
      </div>

      <DatosCuenta />
      <CambioPassword />
    </div>
  );
}

function DatosCuenta() {
  const { user } = useAuthStore();
  const [nombre, setNombre] = useState(user?.nombre ?? '');
  const [comercioNombre, setComercioNombre] = useState(user?.comercioNombre ?? '');
  const esDueno = user?.rol === 'dueno';

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: llamar PATCH /auth/profile (endpoint ya existente en backend).
    toast.info('Edicion de perfil estara disponible proximamente');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Datos de la cuenta
        </CardTitle>
        <CardDescription>Email y rol son inmutables desde aqui</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email-perfil">Email</Label>
              <Input
                id="email-perfil"
                type="email"
                value={user?.email ?? ''}
                disabled
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <div>
                <Badge variant={esDueno ? 'default' : 'secondary'}>
                  {user?.rol ?? '—'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre-perfil">Nombre</Label>
            <Input
              id="nombre-perfil"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comercio-perfil">Nombre del comercio</Label>
            <Input
              id="comercio-perfil"
              value={comercioNombre}
              onChange={(e) => setComercioNombre(e.target.value)}
              maxLength={150}
              disabled={!esDueno}
              readOnly={!esDueno}
            />
            {!esDueno && (
              <p className="text-xs text-muted-foreground">
                Solo el dueño puede modificar el nombre del comercio.
              </p>
            )}
          </div>

          <Button type="submit">Guardar cambios</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function CambioPassword() {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (nueva.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (nueva !== confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }
    // TODO: llamar PATCH /auth/password (endpoint ya existente en backend).
    toast.info('Cambio de contraseña estara disponible proximamente');
    setActual('');
    setNueva('');
    setConfirmar('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Cambiar contraseña
        </CardTitle>
        <CardDescription>
          Despues de cambiarla, tendras que iniciar sesion en otros dispositivos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pwd-actual">Contraseña actual</Label>
            <Input
              id="pwd-actual"
              type="password"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="pwd-nueva">Nueva contraseña (min. 8)</Label>
            <Input
              id="pwd-nueva"
              type="password"
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              minLength={8}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pwd-confirmar">Confirmar nueva contraseña</Label>
            <Input
              id="pwd-confirmar"
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              minLength={8}
              autoComplete="new-password"
              required
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit">Cambiar contraseña</Button>
        </form>
      </CardContent>
    </Card>
  );
}
