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

La validación estructural admite perfiles sintéticos o supuestos únicamente para pruebas locales. `publish:production` aplica además una barrera previa que rechaza pesos sin evidencia de campo y rutas sin fase de despacho validada, antes de inicializar Firestore.

## Configuración externa pendiente antes de producción

1. En Firebase Console, confirmar que el proyecto existente corresponde exactamente al `projectId` autorizado; no crear otro proyecto.
2. Confirmar que la aplicación Android registrada usa `com.avanzailo.app` y obtener su configuración pública por el canal acordado, sin versionar `.env` ni archivos de credenciales.
3. Confirmar plan Blaze, región de Functions, APIs necesarias, presupuesto y alertas de consumo.
4. Registrar la aplicación Android y Play Integrity en App Check. Descargar `google-services.json` por un canal seguro, sin versionarlo; instalar `@react-native-firebase/app` y `@react-native-firebase/app-check`; declarar ambos plugins en Expo; inicializar el proveedor antes de montar la aplicación y conectar `getToken()` con `configureAppCheckTokenProvider`. Esta integración requiere un development/release build (no Expo Go). Activar la exigencia en Console solo después de verificar tokens reales. El backend y el cliente ya fallan de forma cerrada sin token fuera del emulador.
5. Definir el responsable de la publicación (`AVANZA_PUBLICATION_RESPONSIBLE`) y usar credenciales administrativas temporales/ADC con mínimo privilegio.
6. Confirmar la fase de despacho y mediciones de viaje que se publicarán; mientras falten, el servicio devuelve espera promedio etiquetada y no una llegada de unidad.

No se ha ejecutado publicación ni despliegue real. Una vez autorizados los seis puntos, el orden es reglas/índices, Function, snapshot y prueba completa. `publish:production` requiere además `--confirm-production`, `GCLOUD_PROJECT` real y responsable explícito.
