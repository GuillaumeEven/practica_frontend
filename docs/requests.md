# Peticiones HTTP en Angular — Guía rápida

Este documento explica, en español, cómo crear peticiones HTTP con `HttpClient` en Angular: ejemplos prácticos (GET, POST, PUT, DELETE), uso de query params, body JSON, `FormData`, manejo de errores y buenas prácticas.

---

## 1) Preparación

- Asegúrate de importar `HttpClientModule` en tu módulo raíz o donde uses servicios:

```ts
import { HttpClientModule } from '@angular/common/http';
@NgModule({
  imports: [HttpClientModule, /* ... */]
})
export class AppModule {}
```

## 2) Inyección y uso básico

Inyecta `HttpClient` en un servicio y usa los métodos `get`, `post`, `put`, `delete`.

```ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  apiUrl = 'https://api.example.com';
  constructor(private http: HttpClient) {}

  // Observable (ideal para streaming / pipes)
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/usuarios`);
  }

  // Promise usando firstValueFrom (reemplaza toPromise)
  async getUsersPromise() {
    return await firstValueFrom(this.http.get<User[]>(`${this.apiUrl}/usuarios`));
  }
}
```

## 3) Enviar query params y cuerpo JSON (PUT/POST)

- **Importante**: la firma es `http.put<T>(url, body, options?)`. El `body` va como segundo parámetro y las `options` (params, headers, etc.) van en tercero.

Ejemplo correcto (PUT con query params y JSON en body):

```ts
import { HttpParams } from '@angular/common/http';

const params = new HttpParams()
  .set('nickUsuario', username)
  .set('contrasena', password);

const updated = await firstValueFrom(
  this.http.put<Usuario>(
    `${this.apiUrl}/usuarios/${user.id}`, // URL
    user,                                 // body (JSON)
    { params }                            // options: query params, headers...
  )
);
```

- Fallo común: invertir `body` y `options` (p. ej. `http.put(url, options, body)`), lo que provoca que el servidor reciba mal el body.

## 4) Headers y contenido

- Para JSON por defecto no necesitas `JSON.stringify` ni establecer `Content-Type` (Angular lo pone). Si usas `FormData`, no pongas `Content-Type`, el navegador gestionará el boundary.

```ts
const headers = new HttpHeaders({ 'Accept': 'application/json' });
this.http.post(url, body, { headers });
```

Para `FormData` (subida de archivos):

```ts
const fd = new FormData();
fd.append('file', file);
// NO set Content-Type
this.http.post(url, fd);
```

## 5) Manejo de errores

- Con `async/await` (Promise): usar `try/catch`.
- Con Observables: usar `pipe(catchError(...))`.

Ejemplo con `firstValueFrom` y `try/catch`:

```ts
async updateUser(user: Usuario) {
  try {
    const res = await firstValueFrom(this.http.put<Usuario>(`/usuarios/${user.id}`, user));
    return { error: null, data: res };
  } catch (err) {
    return { error: err, data: undefined };
  }
}
```

También puedes usar un helper tipo `to()` que devuelva `[error, data]` o `{ error, data }` para simplificar manejo en componentes.

## 6) Seguridad y buenas prácticas

- Evita enviar contraseñas en query params en producción (se almacenan en logs y caches). Preferir `Authorization` header (Bearer token) o cookies seguras.
- Usa interceptores para añadir tokens o tratar errores globalmente.
- Modo de actualización:
  - Pessimista (recomendado para consistencia): llamar al endpoint `PUT`, esperar respuesta y recargar la lista desde el servidor.
  - Optimista: actualizar UI inmediatamente y hacer rollback si falla (mejor UX, más complejo).

## 7) Ejemplo de flujo recomendado (actualizar usuario y recargar lista)

En el servicio:

```ts
async actualizarUsuario(user: Usuario, username: string, password: string) {
  const params = new HttpParams().set('nickUsuario', username).set('contrasena', password);
  try {
    const updated = await firstValueFrom(this.http.put<Usuario>(`${this.apiUrl}/usuarios/${user.id}`, user, { params }));
    return { error: null, data: updated };
  } catch (error) {
    return { error, data: undefined };
  }
}
```

En el componente que contiene la lista:

```ts
async onUpdSave(updated?: Usuario) {
  if (!updated || typeof updated.id !== 'number') { this.modoUpdPopup = 'CLOSED'; return; }
  const res = await this.userService.actualizarUsuario(updated, nick, pass);
  if (res.error) {
    alert('Error al actualizar: ' + (res.error.message ?? res.error));
    this.modoUpdPopup = 'CLOSED';
    return;
  }
  // recargar la lista desde el servidor para asegurar consistencia
  await this.refreshUsers();
  this.modoUpdPopup = 'CLOSED';
}
```

## 8) Tips rápidos

- `http.get<T>(url, { params })` devuelve `Observable<T>`; convierte a `Promise` con `firstValueFrom()` si prefieres `await`.
- Para detectar cambios en Angular (ChangeDetectionStrategy.OnPush) evita mutaciones in-place; usa `this.users = [...this.users]` después de modificar.
- Muestra un spinner / desactiva botones durante la petición para evitar dobles envíos.

---

Si quieres, puedo:

- Añadir este ejemplo concreto en `src/app/core/services/user.service.ts` y actualizar `UserListComponent` para usarlo.
- Añadir un snippet de interceptor para auth.

Fin de la guía.
