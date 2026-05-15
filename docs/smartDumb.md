# Patrón Smart / Dumb Components en Angular

## Concepto

El patrón **Smart/Dumb** (también llamado **Container/Presentational**) consiste en separar las responsabilidades entre dos tipos de componentes:

| | Smart (Contenedor) | Dumb (Presentacional) |
|---|---|---|
| **Conoce** los servicios | Sí | No |
| **Llama** a la API | Sí | No |
| **Recibe datos** vía | `@Input()` no necesario | `@Input()` |
| **Comunica hacia arriba** | Maneja los eventos | `@Output()` + `EventEmitter` |
| **Lógica de negocio** | Sí | No |
| **Reutilizable** | Poco | Mucho |

---

## Ejemplo en este proyecto

### El componente Dumb: `UserFormPopupComponent`

`UserFormPopupComponent` no sabe nada del backend. Su única responsabilidad es:
1. Mostrar el formulario con los datos recibidos por `@Input()`
2. Emitir el usuario construido cuando el usuario hace clic en "Save"

```typescript
// Solo recibe datos y emite eventos, nunca llama a la API
@Input()  mode: 'create' | 'update' = 'create';
@Input()  user?: UsuarioVM;

@Output() saved    = new EventEmitter<Usuario>();
@Output() cancelled = new EventEmitter<void>();

onSave(): void {
  const domain = toDomain(this.model as UsuarioVM);
  this.saved.emit(domain);  // ← emite, no llama a crearUsuario()
}
```

### El componente Smart: `UserListComponent`

`UserListComponent` es quien conoce el servicio y decide qué hacer con los datos emitidos:

```typescript
// Escucha el evento del popup y decide crear o actualizar
async onFormSaved(user: Usuario): Promise<void> {
  const nick = localStorage.getItem('nickUsuario') ?? '';
  const pass = localStorage.getItem('contrasena') ?? '';

  const res = this.formPopupMode === 'create'
    ? await this.userService.crearUsuario(user, nick, pass)      // ← crea
    : await this.userService.actualizarUsuario(user, nick, pass); // ← actualiza

  await this.refreshUsers();
  this.formPopupMode = 'closed';
}
```

### El enlace entre los dos: el template de `UserListComponent`

```html
<app-user-form-popup
  [mode]="formPopupMode"
  [user]="formPopupMode === 'update' ? selectedUser : undefined"
  (saved)="onFormSaved($event)"
  (cancelled)="closeFormPopup()">
</app-user-form-popup>
```

---

## Flujo completo

```
[UserFormPopupComponent]
  usuario rellena el formulario
  → clic en "Save"
  → onSave() construye el dominio
  → this.saved.emit(domain)
        ↓
[UserListComponent]
  → onFormSaved(user) recibe el evento
  → consulta formPopupMode
  → llama a crearUsuario() o actualizarUsuario()
  → refresca la lista
  → cierra el popup
```

---

## ¿Por qué este patrón?

- **Reutilización**: `UserFormPopupComponent` puede usarse en cualquier parte de la app sin cambios, independientemente de si el contexto es creación, edición, o incluso duplicación.
- **Testabilidad**: el componente dumb se puede testear solo pasándole datos por `@Input()`, sin necesidad de mockear servicios HTTP.
- **Separación de responsabilidades**: el popup no necesita saber nada de credenciales, ni de la lógica de negocio del backend.
