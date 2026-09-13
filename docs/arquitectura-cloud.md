# Arquitectura cloud de AVANZA ILO

## Flujo vigente en código

```text
App Expo/Android
  ├─ lectura pública: publication/current → publishedSnapshots/{dataVersion}
  ├─ caché atómica: último snapshot íntegro publicado
  └─ POST HTTPS: routeId + directionId + punto + expectedDataVersion
                         ↓
Cloud Function `eta` (Node.js 22)
  ├─ App Check en producción, límite de cuerpo y control básico de abuso
  ├─ lectura del snapshot activo en Firestore
  ├─ grafo dirigido + pesos versionados + Dijkstra
  ├─ perfil temporal + llegadas candidatas
  └─ status, etaMinutes, estimatedArrivalAt, method, dataVersion y supuestos
```

Firestore es la fuente maestra publicada. La aplicación no escribe maestros y las reglas públicas solo permiten leer el puntero actual y su snapshot activo. Los borradores y reportes administrativos no son públicos. El cliente no importa el motor ETA: sin conectividad conserva la geometría/ficha de la última caché íntegra e invalida la estimación.

## Documentos

| Ruta | Finalidad | Lectura pública | Escritura cliente |
| --- | --- | --- | --- |
| `publication/current` | Puntero a `dataVersion`, fecha y fuente | Sí | No |
| `publishedSnapshots/{dataVersion}` | Rutas, sentidos, referencias, servicio y pesos validados | Solo si es la versión actual y `status=published` | No |
| `adminCatalogDrafts/{dataVersion}` | Reporte de validación, responsable y estado | No | No |

La promoción válida escribe snapshot, puntero y reporte en una transacción. Un conjunto rechazado deja un reporte administrativo pero no cambia `publication/current`.

## Desarrollo local reproducible

Requisitos: Node.js 20.19.4 o superior y JDK 21 para Firebase Emulator Suite.

```powershell
npm ci
npm --prefix functions ci
npm run verify
npm run test:emulators
```

El emulador usa el proyecto aislado `demo-avanza-ilo`; el publicador exige `FIRESTORE_EMULATOR_HOST`. Los fixtures sintéticos viven solo en pruebas y están etiquetados como tales.

La validación estructural admite perfiles sintéticos o supuestos únicamente para pruebas locales. `publish:production` permite publicar la cartografía validada con `etaReady=false`, pero elimina los pesos provisionales. Para publicar `etaReady=true`, la barrera de producción exige pesos con evidencia de campo y una fase de despacho validada.

## Estado real de Firebase al 2026-09-13

Completado:

- La aplicación Android está registrada con el paquete `com.avanzailo.app`; `google-services.json` permanece local e ignorado por Git.
- Las huellas del certificado de desarrollo están registradas.
- App Check usa debug en development builds y Play Integrity en release; el token del emulador fue validado y el enforcement productivo permanece desactivado.
- Las reglas e índices restrictivos están desplegados.
- El snapshot cartográfico `2026-09-09-oe1-nucleo-v1` está publicado con 3 rutas, 3033 coordenadas y `etaReady=false`.

Pendiente antes de desplegar la Function:

1. Cambiar el proyecto de Spark a Blaze y configurar presupuesto y alertas.
2. Autorizar una región de Functions; el código conserva `us-central1` como valor predeterminado hasta recibir esa decisión.
3. Confirmar las APIs requeridas por Cloud Functions/Cloud Run y autorizar expresamente el despliegue con costo.
4. Aportar pesos de tramos, mediciones de viaje y fases de despacho validados; hasta entonces el backend devuelve `insufficient_data` y no una llegada de unidad.
5. Registrar la huella SHA-256 de la firma release definitiva cuando exista y validar Play Integrity antes de activar enforcement.

`publish:production` requiere `--confirm-production`, `GCLOUD_PROJECT` real, responsable explícito y credencial temporal. El token OAuth no se almacena en el repositorio.
