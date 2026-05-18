# `firstValueFrom` — RxJS

## ¿Qué es?

`firstValueFrom` es una función de RxJS que convierte un `Observable` en una `Promise`.
Espera el **primer valor emitido** por el observable y resuelve la promesa con ese valor.

```ts
import { firstValueFrom } from 'rxjs';
```

---

## ¿Por qué usarlo en lugar de `.toPromise()`?

`.toPromise()` está **obsoleto desde RxJS 7**. Tiene dos comportamientos ambiguos:
- Si el observable está vacío, resuelve con `undefined` (silencioso, difícil de detectar).
- Espera la **completación** del observable, no solo el primer valor.

`firstValueFrom` es explícito: lanza un `EmptyError` si el observable se completa sin emitir nada.

---

## Funcionamiento

```
Observable:  ---[valor1]---[valor2]---...
                    ^
                    | firstValueFrom se detiene aquí y resuelve la Promise
```

1. Se suscribe al observable internamente.
2. En cuanto se emite un valor → resuelve la `Promise` con ese valor.
3. Se desuscribe inmediatamente (sin fugas de memoria).
4. Si el observable emite un error → la `Promise` es rechazada (se puede capturar con `catch`).
5. Si el observable se completa sin emitir nada → lanza `EmptyError`.

---

## Uso básico

```ts
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

// Observable devuelto por HttpClient
const obs$ = this.http.get<Usuario>('/api/v1/usuarios/1');

// Conversión a Promise
const user: Usuario = await firstValueFrom(obs$);
```

---

## Con try/catch (patrón recomendado en este proyecto)

Los `HttpErrorResponse` de Angular se propagan como rechazos de la Promise:

```ts
async getUser(id: number): Promise<{ error: any | null, data?: Usuario }> {
  try {
    const data = await firstValueFrom(
      this.http.get<Usuario>(`${this.apiUrl}/usuarios/${id}`)
    );
    return { error: null, data };
  } catch (err: any) {
    // err es un HttpErrorResponse
    // err.error contiene el body JSON de la respuesta de error de la API:
    // { timestamp, status, error, message, path, code, errors, traceId }
    return { error: err };
  }
}
```

En el componente:
```ts
const res = await this.userService.getUser(42);
if (res.error) {
  alert(res.error.error?.message ?? 'Error desconocido');
  return;
}
console.log(res.data); // Usuario
```

---

## Leer el mensaje de error de la API

Con el formato de error de esta API:
```json
{
  "status": 404,
  "message": "El usuario no ha sido encontrado",
  ...
}
```

Dentro del `catch`, `err` es un `HttpErrorResponse`:
- `err.status` → código HTTP (ej. `404`)
- `err.error` → el body JSON parseado por Angular
- `err.error.message` → **el mensaje de negocio de la API** ✅

```ts
catch (err: any) {
  const apiMessage = err?.error?.message ?? err?.message ?? 'Error desconocido';
  return { error: { raw: err, message: apiMessage } };
}
```

---

## No confundir con `lastValueFrom`

| Función | Cuándo usarla |
|---|---|
| `firstValueFrom` | Observable HTTP (se espera un único valor) |
| `lastValueFrom` | Observable largo (stream), se espera el último valor antes de la completación |

Para las llamadas HTTP de Angular, `firstValueFrom` es **siempre la opción correcta** ya que `HttpClient` emite un único valor y luego se completa.
