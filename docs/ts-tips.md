# Consejos TypeScript: `spread` y *optional chaining*

Breve referencia rápida para recordar lo que vimos.

## Operador spread (`...`)

- Qué hace: copia superficial (shallow copy) de objetos o arrays. Permite "expandir" elementos o propiedades.
- Usos comunes:
  - Objetos: `const b = { ...a, nuevaProp: 1 }` (las propiedades posteriores sobrescriben las anteriores).
  - Arrays: `const c = [...arr1, 4]`.
  - Llamadas: `fn(...args)` para pasar un array como lista de argumentos.

### Ejemplos
```ts
const u = { id: 1, nombre: 'John', genero: { id:1, nombre: 'Hombre' } };
const u2 = { ...u, nombre: 'Juan' }; // copia superficial de u
const arr2 = [...arr1, 5];
function fn(a: number, b: number) {}
const args = [1, 2];
fn(...args);
```

- Precauciones:
  - Copia superficial: las propiedades anidadas siguen siendo referencias al mismo objeto.
  - El orden importa: `{ ...a, x:1 }` vs `{ x:1, ...a }` producen resultados distintos.
  - Tipado: si añades propiedades dinámicas, define un tipo extendido (p. ej. `type UsuarioWithIcon = Usuario & { genderIcon?: string }`).

## Encadenamiento opcional (optional chaining `?.`)

- Qué hace: evita excepciones al acceder a propiedades de `null`/`undefined`. Si la parte anterior es `null`/`undefined`, la expresión devuelve `undefined` en vez de lanzar un error.
- Sintaxis:
  - Propiedad: `obj?.prop`
  - Índice: `arr?.[0]?.prop`
  - Llamada: `fn?.()`

### Ejemplo
```ts
const calle = usuario?.direcciones?.[0]?.nombreCalle ?? '—';
```

- En plantillas Angular: `{{ user?.nombre }}` (safe navigation) para evitar errores cuando `user` es nulo.

- Precauciones:
  - `?.` corta la evaluación y devuelve `undefined`; combina con `??` para un valor por defecto.
  - No sustituye la validación: sigue siendo buena idea normalizar/parsear datos en el componente.

## Buenas prácticas rápidas

- Pre-calcula valores derivados (ej.: `genderIcon`) en el componente en `ngOnInit`, no en el template.
- Usa spread para inmutabilidad superficial; para copias profundas usa `structuredClone()` o librerías especializadas.
- Combina `?.` con `??` para defaults legibles.

---

### Nota sobre `pad` y `padStart`

- En muchos snippets es práctico crear una pequeña función `pad` para formatear números (horas, minutos, día, mes) a 2 dígitos:

```ts
const pad = (n: number) => n.toString().padStart(2, '0');
```

- `padStart` es un método de `String` que añade caracteres al inicio de la cadena hasta alcanzar la longitud deseada: `str.padStart(targetLength, padString)`.
  - Ejemplos: `'5'.padStart(2,'0')` → `'05'`; `'12'.padStart(2,'0')` → `'12'`.

- Uso típico: convertir partes de una fecha en cadenas con dos dígitos antes de concatenar el formato final.

---
