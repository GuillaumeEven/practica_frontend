# Guía Angular: de la vista de conjunto al código concreto

Referencia completa del proyecto `practica_frontend`.  
Combina teoría, esquemas y ejemplos sacados directamente del código.

---

## Índice

1. [¿Qué es Angular? Vista de conjunto](#1-qué-es-angular-vista-de-conjunto)
2. [El árbol de componentes de esta app](#2-el-árbol-de-componentes-de-esta-app)
3. [Anatomía de un componente](#3-anatomía-de-un-componente)
4. [Ciclo de vida (lifecycle hooks)](#4-ciclo-de-vida-lifecycle-hooks)
5. [Comunicación padre → hijo (`@Input`)](#5-comunicación-padre--hijo-input)
6. [Comunicación hijo → padre (`@Output`)](#6-comunicación-hijo--padre-output)
7. [El patrón `initModel`](#7-el-patrón-initmodel)
8. [Servicios e inyección de dependencias](#8-servicios-e-inyección-de-dependencias)
9. [Routing](#9-routing)
10. [Formularios template-driven](#10-formularios-template-driven)
11. [Consejos TypeScript](#11-consejos-typescript)

---

## 1. ¿Qué es Angular? Vista de conjunto

Angular es un framework de front-end basado en **componentes**.  
Cada pieza de la interfaz (tabla, popup, cabecera…) es un **componente** independiente: tiene su propio HTML, CSS y TypeScript.

```
┌─────────────────────────────────────────────────────────┐
│                        Navegador                        │
│                                                         │
│  index.html  ──►  <app-root>  ──►  AppComponent        │
│                                        │                │
│                                        │  Router        │
│                                   ┌───┴───┐             │
│                             Login │       │ Shell       │
│                                   │       │  ├─ Header  │
│                                   │       │  └─ Users   │
└───────────────────────────────────────────────────────────┘
```

**Piezas clave:**

| Pieza | Papel |
|---|---|
| **Component** | Bloque visual: HTML + CSS + lógica TS |
| **Service** | Lógica de negocio reutilizable (llamadas HTTP, utilidades) |
| **Router** | Controla qué componente mostrar según la URL |
| **Module / `imports`** | Declara qué piezas puede usar cada componente |

---

## 2. El árbol de componentes de esta app

Los componentes se organizan en un árbol. El **padre** contiene (y controla) al **hijo**.

```
AppComponent
└── RouterOutlet
    ├── LoginComponent           (ruta /login)
    └── ShellComponent           (ruta /*)
        ├── HeaderComponent      (siempre visible)
        └── RouterOutlet
            └── UserListComponent          (ruta /usuarios)
                └── UserFormPopupComponent (condicional)
```

`ShellComponent` es la "cáscara" autenticada: monta el `Header` y deja hueco (`RouterOutlet`) para la página activa.

```ts
// shell.component.ts — tan simple como esto:
@Component({ selector: 'app-shell', standalone: true,
  imports: [RouterOutlet, HeaderComponent] })
export class ShellComponent {}
```

```ts
// app.routes.ts — define el árbol de rutas
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: ShellComponent,
    children: [
      { path: 'usuarios', component: UserListComponent }
    ]
  }
];
```

---

## 3. Anatomía de un componente

Todo componente Angular tiene tres partes en el decorador `@Component`:

```ts
@Component({
  selector: 'app-user-form-popup',   // etiqueta HTML que lo invoca
  templateUrl: './...html',          // plantilla
  styleUrls:   ['./...css'],         // estilos encapsulados
  standalone: true,                  // sin NgModule (Angular 14+)
  imports: [CommonModule, FormsModule] // qué directivas usa la plantilla
})
export class UserFormPopupComponent { ... }
```

- **`selector`**: el nombre del "tag" que usará el padre: `<app-user-form-popup>`.
- **`standalone: true`**: la forma moderna; el componente se autogestiona sin `NgModule`.
- **`imports`**: lista los módulos/componentes que la plantilla de *este* componente necesita.

---

## 4. Ciclo de vida (lifecycle hooks)

Angular llama a métodos especiales en momentos concretos. Los más usados:

```
Creación del componente
        │
        ▼
   constructor()       ← inyección de dependencias
        │
        ▼
   ngOnChanges()       ← cada vez que un @Input cambia (ANTES de ngOnInit la primera vez)
        │
        ▼
   ngOnInit()          ← inicialización (UNA sola vez)
        │
        ▼
   [renders, cambios]
        │
        ▼
   ngOnDestroy()       ← limpieza (suscripciones, timers…)
```

### `ngOnInit` — inicialización única

Se ejecuta **una sola vez** justo después de que los `@Input` están disponibles.  
Úsalo para cargar datos iniciales:

```ts
// user-form-popup.component.ts
async ngOnInit(): Promise<void> {
  this.initModel();       // prepara el formulario
  await this.loadCombos(); // carga géneros y puestos de la API
}
```

### `ngOnChanges` — reacción a cambios de `@Input`

Se lanza **cada vez** que el padre cambia el valor de un `@Input` (incluida la primera vez).  
Recibe un objeto `SimpleChanges` que contiene el valor anterior y el nuevo.

```ts
// user-form-popup.component.ts
ngOnChanges(changes: SimpleChanges): void {
  // 'changes' es un mapa: { nombreInput: SimpleChange }
  if (changes['user'] || changes['mode']) {
    this.initModel(); // re-inicializar el formulario con los nuevos datos
  }
}
```

**¿Por qué no solo `ngOnInit`?**  
Porque el padre puede *reutilizar* el mismo componente hijo cambiando sus `@Input`  
(ej.: abrir el popup de edición para un usuario, cerrarlo y abrirlo para otro).  
`ngOnInit` no se vuelve a llamar, pero `ngOnChanges` sí.

---

## 5. Comunicación padre → hijo (`@Input`)

El padre "pasa datos" al hijo mediante atributos HTML con corchetes `[propiedad]`.  
El hijo los recibe con el decorador `@Input()`.

### Esquema

```
UserListComponent (padre)
        │
        │  [mode]="formPopupMode"       ←── datos
        │  [user]="selectedUser"        ←── datos
        ▼
UserFormPopupComponent (hijo)
```

### En el hijo (declaración)

```ts
// user-form-popup.component.ts
@Input() mode: 'create' | 'update' = 'create';
@Input() user?: UsuarioVM;   // opcional: solo en modo 'update'
```

### En el padre (uso en plantilla)

```html
<!-- user-list.component.html -->
<app-user-form-popup
  [mode]="formPopupMode"
  [user]="formPopupMode === 'update' ? selectedUser : undefined">
</app-user-form-popup>
```

- `[mode]` vincula la propiedad `formPopupMode` del padre al `@Input() mode` del hijo.
- Si el padre cambia `formPopupMode`, Angular actualiza el hijo y dispara `ngOnChanges`.

---

## 6. Comunicación hijo → padre (`@Output`)

El hijo "notifica eventos" al padre mediante `EventEmitter`.  
El padre escucha con paréntesis `(evento)="método($event)"`.

### Esquema

```
UserFormPopupComponent (hijo)
        │
        │  (saved)="onFormSaved($event)"    ──► recibe Usuario
        │  (cancelled)="closeFormPopup()"   ──► sin datos
        ▼
UserListComponent (padre)
```

### En el hijo (declaración y emisión)

```ts
// user-form-popup.component.ts
@Output() saved    = new EventEmitter<Usuario>();
@Output() cancelled = new EventEmitter<void>();

onSave(): void {
  const domain = toDomain(this.model as UsuarioVM);
  this.saved.emit(domain);     // ← envía el objeto al padre
}

onCancel(): void {
  this.cancelled.emit();       // ← señal sin datos
}
```

### En el padre (escucha en plantilla)

```html
<!-- user-list.component.html -->
<app-user-form-popup
  (saved)="onFormSaved($event)"
  (cancelled)="closeFormPopup()">
</app-user-form-popup>
```

```ts
// user-list.component.ts
async onFormSaved(user: Usuario): Promise<void> {
  // user es el objeto que emitió el hijo
  await this.userService.actualizarUsuario(user, nick, pass);
  this.formPopupMode = 'closed';
}
```

### Regla de oro

> **Los datos bajan (`@Input`), los eventos suben (`@Output`).**  
> Un hijo nunca modifica directamente las propiedades del padre.

---

## 7. El patrón `initModel`

`initModel` es un **patrón de diseño** (no una API de Angular) para inicializar o resetear  
el modelo interno del formulario según el modo y los `@Input` recibidos.

### ¿Por qué existe?

El formulario necesita "arrancar" de un estado distinto según el contexto:
- **Modo `create`** → objeto vacío.
- **Modo `update`** → copia del usuario existente.

Y puede necesitar **reiniciarse** si el padre cambia los `@Input` (gracias a `ngOnChanges`).

### Implementación en este proyecto

```ts
// user-form-popup.component.ts
private initModel(): void {
  if (this.mode === 'update' && this.user) {
    // Copia superficial del ViewModel: edita una copia, no el original
    this.model = { ...this.user };
    this.normalizeDates();
    // Convierte las direcciones al formato interno del formulario (DireccionRow)
    this.addressRows = (this.user.direcciones ?? []).map(d => ({
      id: d.id,
      nombreCalle: d.nombre_calle ?? '',
      numeroCalle: d.numero_calle ?? undefined,
      direccionPrincipal: d.direccion_principal ?? false,
      isEditing: false,
      isNew: false
    }));
    if (this.addressRows.length > 0) this.selectedAddressIdx = 0;
  } else {
    // Modo create: todos los campos en null/vacío
    this.model = {
      id: null, nickUsuario: null, nombre: null,
      contrasena: null, admin: false, direcciones: []
      // ...
    };
    this.addressRows = [];
    this.selectedAddressIdx = null;
  }
}
```

**Claves del patrón:**
- Usa `{ ...this.user }` (spread) para evitar mutar el objeto original del padre.
- Se llama tanto desde `ngOnInit` (primera carga) como desde `ngOnChanges` (cambios posteriores).
- Separa la lógica de inicialización en un método privado para mantener `ngOnInit` limpio.

---

## 8. Servicios e inyección de dependencias

Un **servicio** es una clase Angular con lógica reutilizable (llamadas HTTP, utilidades…).  
Se inyecta en los componentes mediante el constructor — Angular gestiona la instancia.

```ts
// Declaración del servicio
@Injectable({ providedIn: 'root' })  // singleton global
export class UserService {
  async obtenerUsuarios(nick: string, pass: string): Promise<...> { ... }
}
```

```ts
// Uso en el componente
export class UserListComponent {
  constructor(private userService: UserService) {}
  //                  ↑ Angular provee la instancia automáticamente

  async ngOnInit() {
    const result = await this.userService.obtenerUsuarios(nick, pass);
  }
}
```

`providedIn: 'root'` significa que es un **singleton**: toda la app comparte la misma instancia.

---

## 9. Routing

El router de Angular muestra el componente correcto según la URL, sin recargar la página.

```ts
// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ShellComponent,   // layout envolvente
    children: [
      { path: 'usuarios', component: UserListComponent }
    ]
  }
];
```

- **`<router-outlet>`** en la plantilla del padre es el hueco donde el router inyecta el hijo.
- Rutas **anidadas** (`children`): `ShellComponent` envuelve sus hijos — el header siempre visible,  
  el contenido varía según la sub-ruta.
- Navegar desde código: `this.router.navigate(['/login'])`.

---

## 10. Formularios template-driven

Angular ofrece dos enfoques de formularios. Este proyecto usa **template-driven** (más simple).

### `[(ngModel)]` — two-way binding

```html
<!-- user-form-popup.component.html (ejemplo típico) -->
<input [(ngModel)]="model.nombre" name="nombre" />
```

El operador `[()]` (banana in a box) combina:
- `[ngModel]` → Angular escribe el valor en el campo cuando `model.nombre` cambia.
- `(ngModelChange)` → Angular actualiza `model.nombre` cuando el usuario escribe.

### Select con objetos y `compareWith`

Cuando el `<select>` usa objetos completos (no primitivos), hay que decirle a Angular  
cómo comparar si dos objetos son "el mismo":

```html
<select [(ngModel)]="model.genero" [compareWith]="compareById">
  <option *ngFor="let g of generos" [ngValue]="g">{{ g.nombre }}</option>
</select>
```

```ts
compareById(a: any, b: any): boolean {
  return a && b ? a.id === b.id : a === b;
}
```

Sin `compareWith`, Angular no sabría que `{id:1, nombre:'Hombre'}` recuperado de la API  
es el mismo que `{id:1, nombre:'Hombre'}` del array — son objetos distintos en memoria.

---

## 11. Consejos TypeScript

*(contenido original de este documento)*

### Operador spread (`...`)

- Copia superficial (shallow copy) de objetos o arrays.
- Las propiedades posteriores sobrescriben las anteriores.

```ts
const u = { id: 1, nombre: 'John', genero: { id:1, nombre: 'Hombre' } };
const u2 = { ...u, nombre: 'Juan' }; // copia superficial de u

const arr2 = [...arr1, 5];

function fn(a: number, b: number) {}
fn(...[1, 2]);
```

- **Precaución**: copia superficial — las propiedades anidadas siguen siendo referencias.
- Para copias profundas: `structuredClone(obj)`.
- En `initModel`: `this.model = { ...this.user }` crea una copia editable sin tocar el original.

### Encadenamiento opcional (`?.`)

Evita excepciones al acceder a propiedades de `null`/`undefined`:

```ts
const calle = usuario?.direcciones?.[0]?.nombreCalle ?? '—';
```

- En plantillas Angular: `{{ user?.nombre }}` (safe navigation operator).
- Combinar con `??` para valores por defecto: si el resultado es `undefined`, usa el fallback.

### `Partial<T>`

```ts
model: Partial<UsuarioVM> = {};
```

`Partial<T>` convierte todas las propiedades de `T` en opcionales.  
Útil para buffers de formulario que se rellenan progresivamente.

### `padStart` para formatear números

```ts
const pad = (n: number) => n.toString().padStart(2, '0');
// pad(5)  → '05'
// pad(12) → '12'
```

Usado en `user.mapper.service.ts` para formatear fechas y horas.

### Buenas prácticas

- Pre-calcula valores derivados (`genderIcon`, `age`…) en el servicio/mapper, no en la plantilla.
- Usa spread para inmutabilidad superficial; `structuredClone()` para copias profundas.
- Combina `?.` con `??` para defaults legibles.
- `async/await` con `Promise.all` para llamadas paralelas:

```ts
// loadCombos en user-form-popup.component.ts
const [gRes, pRes] = await Promise.all([
  this.userService.obtenerGeneros(nick, pass),
  this.userService.obtenerPuestosDeTrabajo(nick, pass)
]);
```

### Async/Promises (explicación breve)

- Una función marcada `async` devuelve siempre una `Promise`.
- `await` pausa la ejecución de la función `async` hasta que la `Promise` se resuelva (o rechace).
- Si dentro de una `async` haces `await otraFunc()`, la primera función queda en espera hasta que `otraFunc()` termine — esto crea una cadena de Promises.
- `Promise.all([p1, p2])` ejecuta las Promises en paralelo y devuelve una `Promise` que se resuelve con un array de resultados. Por ejemplo: `const [gRes, pRes] = await Promise.all([obtenerGeneros(), obtenerPuestos()])` donde `gRes` y `pRes` son las respuestas individuales.
- En Angular es común declarar `async ngOnInit()` y `await` llamadas internas; `ngOnInit` devolverá una Promise que se resuelve cuando todas las operaciones `await` internas hayan finalizado.


---

*Última actualización: mayo 2026*

## Accesibilidad: ARIA y focus trap

Objetivo: hacer que el popup sea legible para lectores de pantalla y completamente usable con teclado.

Puntos esenciales
- Rol y atributos ARIA: marcar el diálogo con `role="dialog"`, indicar si es modal con `aria-modal="true"`, y enlazar título/descripcion con `aria-labelledby` y `aria-describedby`. El botón que abre debe usar `aria-haspopup="dialog"`, `aria-expanded="true|false"` y `aria-controls="ID_DEL_DIALOG"`.
- Focus inicial: al abrir, mover el foco al primer elemento focusable del popup (o al título).
- Focus trap: capturar `Tab` / `Shift+Tab` para mantener el foco dentro del popup mientras esté abierto.
- Atajos de teclado: `Esc` debe cerrar el popup. Todos los controles deben ser accesibles por teclado.
- Restaurar el foco: al cerrar, devolver el foco al botón que abrió el popup.
- Visuales y anuncios: estilos de foco visibles; usar `aria-live` para mensajes dinámicos si es necesario.
- Pruebas: comprobar navegación solo con teclado, uso con lector de pantalla (NVDA/VoiceOver) y pasar herramientas como axe o Lighthouse.

Ejemplo HTML mínimo
```html
<button id="openGenero"
        aria-label="Gestionar géneros"
        aria-haspopup="dialog"
        aria-expanded="false"
        aria-controls="generoDialog">
  🏷️
</button>

<div id="generoDialog"
     role="dialog"
     aria-modal="true"
     aria-labelledby="generoTitle"
     aria-describedby="generoDesc"
     hidden>
  <h2 id="generoTitle">Gestionar géneros</h2>
  <p id="generoDesc">Crear, editar o eliminar un género</p>
  <button id="closeGenero" aria-label="Cerrar">✖</button>
  <!-- controles focusables: inputs, buttons, selects -->
</div>
```

Ejemplo JS simple de focus trap (vanilla)
```js
const opener = document.getElementById('openGenero');
const dialog = document.getElementById('generoDialog');
const closeBtn = document.getElementById('closeGenero');
let previouslyFocused;

const focusableSel = 'a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])';

function openDialog() {
  previouslyFocused = document.activeElement;
  dialog.hidden = false;
  opener.setAttribute('aria-expanded', 'true');
  const focusable = Array.from(dialog.querySelectorAll(focusableSel)).filter(el => !el.disabled);
  (focusable[0] || dialog).focus();
  document.addEventListener('keydown', handleKey);
}

function closeDialog() {
  dialog.hidden = true;
  opener.setAttribute('aria-expanded', 'false');
  document.removeEventListener('keydown', handleKey);
  previouslyFocused?.focus();
}

function handleKey(e) {
  if (e.key === 'Escape') { closeDialog(); return; }
  if (e.key !== 'Tab') return;
  const focusable = Array.from(dialog.querySelectorAll(focusableSel)).filter(el => !el.disabled);
  if (focusable.length === 0) { e.preventDefault(); return; }
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

opener.addEventListener('click', openDialog);
closeBtn.addEventListener('click', closeDialog);
```

Notas prácticas
- En Angular, implementa la lógica en el componente (en los hooks de apertura/cierre) y usa `Renderer2` si necesitas manipular el DOM de forma segura.
- Si prefieres evitar la implementación manual, usa `@angular/cdk` (`cdkTrapFocus` y `Dialog`) para gestión accesible del foco y del diálogo.
- Prueba: cierre con `Esc`, navegación completa con `Tab`, y restauración del foco al abrir/cerrar.

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
