# Práctica Final — Frontend (Angular 19)

Aplicación web desarrollada en **Angular 19** para la gestión de usuarios, direcciones, géneros y puestos de trabajo. Este frontend consume la API REST del backend Java Spring Boot (consultable [aquí](https://github.com/GuillaumeEven/practica_backend)).

---

## 🚀 Resumen rápido
- Login simple (usuario/contraseña)
- Listado de usuarios
- CRUD de usuarios y direcciones (crear, editar, eliminar)
- Gestión de géneros y puestos de trabajo (consulta)
- Integración directa con la API REST del backend

---

## 🛠 Requisitos
- Node.js 18+
- Angular CLI 19
- Backend en ejecución (`../practica_backend`)

---

## ⚡ Instalación y arranque

1. Instala dependencias:
   ```bash
   npm install
   ```

2. Arranca el frontend:
   ```bash
   ng serve
   ```

3. Accede a la app en:
   [http://localhost:4200](http://localhost:4200)

> **Nota:** El frontend espera que el backend esté disponible en `http://localhost:8080/api/v1` (ver `src/app/shared/contants/const-urls.ts`).

---

## 📦 Estructura principal

- `src/app/core/models/` — modelos TypeScript (`Usuario`, `Direccion`, `Genero`, `PuestoDeTrabajo`)
- `src/app/core/services/` — servicios Angular para login, usuarios, mapeo y utilidades
- `src/app/features/` — componentes funcionales (login, lista de usuarios, popups)
- `src/app/shared/contants/` — constantes de rutas, URLs y localStorage
- `src/assets/mocks/` — datos de ejemplo (solo para desarrollo)
- `docs/` — documentación técnica y guías

---

## 🔗 Integración con el backend

- El frontend consume la API REST definida en el [backend Java Spring Boot](https://github.com/GuillaumeEven/practica_backend).
- Todas las operaciones (login, CRUD de usuarios, consulta de géneros/puestos) se realizan vía HTTP.
- El login es simulado (no seguro para producción), solo para fines didácticos.

---


## 📚 Documentación

Consulta la carpeta [`docs/`](./docs/) para acceder al índice completo de documentación técnica y guías del proyecto. 

- [Tabla de contenidos y acceso rápido](./docs/table-of-contents.md)

Incluye:
- Enunciado completo del ejercicio
- Uso de `firstValueFrom` (RxJS)
- Peticiones HTTP en Angular
- Patrón Smart/Dumb Components
- Consejos y tips de TypeScript

---

## 📝 Notas
- El proyecto sigue el patrón de componentes standalone de Angular 15+.
- El código está alineado con la estructura y requisitos del backend.
- Para detalles de endpoints y modelo de datos, consulta el README del backend y Swagger UI (`/api/v1/swagger-ui.html`).

---

© Máster Ediae — Granada, 2026
