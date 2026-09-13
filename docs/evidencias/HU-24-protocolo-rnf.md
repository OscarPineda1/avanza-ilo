# HU-24 · Protocolo de validación no funcional

Este archivo prepara la medición; no declara resultados de dispositivo ni producción que todavía no se han ejecutado.

## Condiciones que deben registrarse

- APK/commit, `dataVersion`, Function y región.
- Marca/modelo, versión Android (mínimo Android 8), RAM y estado térmico.
- Red, latencia aproximada y si la Function estaba fría o caliente.
- Cinco repeticiones como mínimo por condición y evidencia de pantalla/logcat.
- GPS aceptado, denegado, revocado y precisión insuficiente; caché ausente, válida y dañada.

La app emite una única línea no personal `AVANZA_METRIC app_ready_ms=<n>` cuando el contenedor de navegación queda listo. La Function devuelve `Server-Timing` con `firestore`, `eta` y `app`; la diferencia entre el tiempo total del cliente y `app` aproxima red/transporte.

## Matriz de ejecución

| Caso | Dispositivo/red | Repeticiones | Umbral | Resultado real | Evidencia |
| --- | --- | ---: | --- | --- | --- |
| Inicio frío | Pendiente | ≥5 | <3 s | Pendiente | video + logcat |
| Consulta ETA | Pendiente | ≥5 | ≤2 s | Pendiente | cronómetro + `Server-Timing` |
| Flujo buscar→punto→respuesta | Pendiente | ≥5 | ≤5 toques | Pendiente | video |
| Android 8+ | Pendiente | 1 por versión | instala y completa flujo | Pendiente | captura/video |
| Offline con caché | Pendiente | ≥3 | ficha/geometría; sin ETA | Pendiente | video |
| Offline sin caché | Pendiente | ≥3 | error controlado; sin ETA | Pendiente | video |
| Wi‑Fi sin Internet / timeout / 5xx | Pendiente | ≥3 | estado controlado; ETA inválido | Pendiente | video/log |
| Legibilidad/contraste/tamaño | Pendiente | 1 revisión | acuerdo del equipo | Pendiente | checklist/capturas |

## Procedimiento

1. Instalar el APK autorizado, limpiar datos y detener la app.
2. Iniciar captura de pantalla y `adb logcat`; abrir la app cinco veces limpiando el proceso entre repeticiones.
3. Para ETA, fijar la misma ruta, sentido, punto y `dataVersion`; registrar tiempo total y las tres duraciones de `Server-Timing`.
4. Repetir con red normal, red degradada, Wi‑Fi sin salida, modo avión y backend 5xx controlado.
5. Contar toques desde la pantalla principal hasta el resultado sin contar el lanzamiento del sistema.
6. Revisar texto recortado, contraste, lectores de accesibilidad y permisos en Android 8 o superior.

La cobertura dentro de cinco minutos no pertenece a esta matriz de rendimiento; se calcula únicamente con observaciones de campo reservadas en HU-25.

## Evidencia automatizada local (no sustituye la prueba en dispositivo)

Registro del 2026-09-13:

- `npm run verify`: 28 pruebas de aplicación/dominio y 7 de Functions satisfactorias, además de TypeScript, build de Functions y validación estructural del catálogo.
- Firebase Emulator Suite: 3 pruebas integradas satisfactorias para reglas, publicación, contrato ETA, versión obsoleta, métodos, cuerpo máximo y límite de solicitudes.
- Expo Doctor: 18/18 comprobaciones satisfactorias en la revisión de dependencias del SDK 54.
- Auditoría de producción de Functions: 0 vulnerabilidades. La aplicación conserva 24 avisos transitivos (15 moderados y 9 altos, 0 críticos) de la cadena Expo/Metro/navegación; el arreglo sugerido exige una actualización mayor incompatible, por lo que no se aplicó `--force`.

No se convierten estos resultados en tiempos de inicio/ETA, compatibilidad Android ni accesibilidad: faltan dispositivo, red y backend reales. El emulador local ejecutó con Node 24 del host aunque `functions/package.json` declara Node 22 para el runtime objetivo; la equivalencia exacta debe verificarse antes del despliegue.
