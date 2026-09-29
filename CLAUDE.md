@AGENTS.md
## Formato de commits

Usar siempre este formato exacto. Sin "Co-Authored-By".

```
feat: estacionamiento vX.X.X — descripción corta

════════════════════════════════════════
NombreArchivo.ts
════════════════════════════════════════
- Cambio 1
- Cambio 2

════════════════════════════════════════
OtroArchivo.ts
════════════════════════════════════════
- Cambio 1

════════════════════════════════════════
SEGURIDAD  (solo si aplica)
════════════════════════════════════════
- ...

════════════════════════════════════════
ARCHIVOS NUEVOS  (solo si aplica)
════════════════════════════════════════
- Archivo.ts — descripción

════════════════════════════════════════
ARCHIVOS MODIFICADOS
════════════════════════════════════════
- Archivo.ts
- OtroArchivo.ts

════════════════════════════════════════
CAMBIOS FUERA DEL CODIGO (ej cambios en servidor o infraestructura)
════════════════════════════════════════
- Migración ejecutada, despliegue, variable de entorno agregada, etc.

════════════════════════════════════════
DEPENDENCIAS  (solo si aplica)
════════════════════════════════════════
- Agrega @nestjs/config ^3.x para variables de entorno
- Actualiza expo de 57.x a 58.x
```

### Tipos de commit

- `feat` — nueva funcionalidad
- `fix` — corrección de bug
- `style` — cambios visuales/diseño sin lógica
- `refactor` — refactorización sin cambio de comportamiento
- `chore` — configuración, dependencias, build
- `docs` — documentación

### Reglas

- Una línea de resumen arriba, concisa
- Agrupar cambios por sección/módulo con título
- Listar archivos nuevos y modificados al final separados
- Sin "Co-Authored-By" en ningún commit
- No commitear por cada archivo — commitear cuando una unidad lógica esté completa