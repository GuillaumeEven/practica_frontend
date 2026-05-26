# Catalog Service

This document explains the `CatalogService` used in the frontend to propagate catalog changes (genres and job positions) in real time.

Purpose
- Provide a small reactive channel to broadcast updates for shared lookup data used by multiple components (for example: `generos`, `puestosDeTrabajo`).
- Avoid tight coupling between UI components when a catalog changes (create / update / delete) so selects and lists remain consistent.

Location
- Service file: `src/app/core/services/catalog.service.ts`

API
- `generos$(): Observable<Genero[]>` — subscribe to genre list changes.
- `puestos$(): Observable<PuestoDeTrabajo[]>` — subscribe to job positions list changes.
- `setGeneros(items: Genero[]): void` — publish a new genre list to subscribers.
- `setPuestos(items: PuestoDeTrabajo[]): void` — publish a new puestos list to subscribers.

Behavior and usage
- Managers (genre/puesto popups) call `setGeneros` / `setPuestos` after they create, update or delete items. That publishes the updated list to all subscribers.
- Components that depend on those catalogs (for example `UserFormPopupComponent`, `UserListComponent`) subscribe to the observables to refresh their local data when catalogs change.

Example — subscribe in a component
```ts
constructor(private catalog: CatalogService) {}

ngOnInit() {
  this.catalog.generos$().subscribe(g => this.generos = g);
  this.catalog.puestos$().subscribe(p => this.puestos = p);
}
```

Example — publish from a manager after saving
```ts
// after creating/updating/deleting
this.catalog.setPuestos(updatedList);
```

Notes
- The service uses `BehaviorSubject` so subscribers get the latest value immediately.
- The service is intentionally small and focused: it does not perform HTTP requests. Managers still call the backend (via `UserService`) then publish the resulting lists.
- Prefer this simple reactive approach when many components need to react to catalog changes without adding heavyweight state management.
