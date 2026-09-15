# HU-26 · Compilación, despliegue y respaldo reproducibles

Estado: compilación y flujo productivo verificados en emulador Android. Las reglas, índices, snapshot operativo y Function HTTPS están desplegados; la instalación y evidencia audiovisual en el teléfono físico objetivo siguen pendientes porque ese dispositivo no estuvo conectado por ADB.

## Activación productiva verificada el 2026-09-15

- Snapshot activo: `2026-09-15-oe1-oe2-validado-v1`, con `cartographyReady=true` y `etaReady=true`.
- Alcance validado: 3 rutas, 3 sentidos/circuitos, 3,033 coordenadas, 27 referencias y 3,030 aristas.
- Function `eta` actualizada satisfactoriamente en `us-central1`.
- App Check: llamada sin token rechazada con HTTP 401; development build Android autorizado obtuvo token válido.
- Prueba productiva autenticada: 1A, D y 14 respondieron `available`, método `directed_dijkstra_with_dispatch_candidates` y la versión activa.
- Evidencia visual en emulador: Ruta 1A mostró `LLEGADA ESTIMADA` con los datos de la versión activa.
- Build Android de desarrollo: `assembleDebug` satisfactorio (643 tareas; 214 ejecutadas y 429 actualizadas).
- APK copiado a `outputs/apk/Avanza-Ilo-development-2026-09-15.apk`, 164,558,568 bytes.
- SHA-256: `F6AD698464FFFB9C44F9BCB47762C8532122797940477F08D0C16F92D9C6071B`.
- El APK es un development build multiarquitectura firmado con la llave debug local; no es un binario de distribución.

## Compilación local ejecutada el 2026-09-13

- `assembleRelease`: satisfactorio (480 tareas; 387 ejecutadas y 93 actualizadas).
- Commit de aplicación usado: `b39fffa`.
- APK de comprobación: `android/app/build/outputs/apk/release/app-release.apk`, 69,878,553 bytes.
- SHA-256: `473F1631DD7632446A06961B27FADA3C1E9582776D2CD68D22D8DC035BB462F3`.
- Manifest: `com.avanzailo.app`, minSdk 24 (compatible por nivel de API con Android 8/API 26).
- Firma: verificada con APK Signature Scheme v2, usando la configuración de depuración existente; **no es firma de distribución**.
- No había dispositivo conectado, por lo que instalación, inicio frío y flujo contra entorno real permanecen pendientes.
- El APK citado se generó antes del despliegue del endpoint ETA y no es el APK evaluable de cierre. El `.env` local actual ya apunta a la Function autorizada, pero la recompilación integral queda reservada para el cierre final de HU-26.

## Ejecución en un teléfono durante desarrollo

Expo Go no es compatible con los módulos nativos `@react-native-firebase/app` y `@react-native-firebase/app-check` usados por AVANZA ILO. Para un teléfono Android conectado por USB:

1. Habilitar Depuración USB y aceptar la autorización RSA del equipo.
2. Ejecutar `npm run android:build:debug` una vez para generar el development build.
3. Ejecutar `npm run device:android`; el script selecciona primero un dispositivo físico, instala el APK si falta, configura `adb reverse tcp:8081 tcp:8081` y abre la app contra Metro.

El APK de desarrollo queda en `android/app/build/outputs/apk/debug/app-debug.apk`. App Check usa el proveedor debug en este binario; el secreto emitido por cada teléfono debe registrarse de forma privada en Firebase Console y nunca almacenarse en Git. El APK de distribución definitivo debe usar firma release y Play Integrity.

## Manifiesto de la entrega

Relacionar en un único registro: commit, estado limpio de Git, SHA-256 del APK, package `com.avanzailo.app`, versión Expo/app, Node/Java, `projectId`, región, nombre/revisión de Function, `dataVersion`, fecha/responsable de publicación y hashes de reglas/índices. Nunca incluir claves, tokens, `.env`, credenciales ADC ni configuración privada.

## Compilación local

```powershell
npm ci
npm --prefix functions ci
npm run verify
npm run test:emulators
npx expo prebuild --platform android --no-install
Set-Location android
.\gradlew.bat assembleRelease
```

El APK se obtiene en `android/app/build/outputs/apk/release/`. El directorio nativo y los APK están ignorados; copiar el artefacto a un almacén aprobado y registrar su hash. No afirmar compatibilidad hasta instalar y completar el flujo del protocolo HU-24 en Android 8 o superior.

## Despliegue autorizado y ejecutado el 2026-09-14

Se confirmó `projectId=avanza-ilo`, aplicación Android `com.avanzailo.app`, Blaze, región `us-central1`, APIs requeridas, presupuesto global de S/1, alerta temprana al 1% y límite de inversión de S/1 para Cloud Run Functions. La Function `eta` quedó activa; el siguiente bloque conserva el procedimiento reproducible.

```powershell
npx firebase-tools use <PROJECT_ID>
npx firebase-tools deploy --only firestore:rules,firestore:indexes
npx firebase-tools deploy --only functions:eta
$env:GCLOUD_PROJECT='<PROJECT_ID>'
$env:AVANZA_PUBLICATION_RESPONSIBLE='<CODIGO_RESPONSABLE>'
npm --prefix functions run publish:production
```

Para publicar la línea base operativa validada de pesos y despachos se usa, después de la autorización humana:

```powershell
npm --prefix functions run publish:production:validated
```

La última orden contiene la confirmación interna del publicador, pero no sustituye la autorización humana previa. Tras publicar, probar lectura pública, escritura denegada, versión obsoleta, App Check, ETA y errores controlados.

## Respaldo y restauración

El respaldo mínimo incluye el commit/etiqueta, lockfiles, `firebase.json`, reglas, índices, fuentes de Functions, catálogo fuente y un export de Firestore de la versión publicada. Los exports pueden generar almacenamiento/costo y solo se ejecutan con autorización.

Restauración de prueba sin costo cloud:

```powershell
npm ci
npm --prefix functions ci
npm run verify
npm run test:emulators
npm run demo:arrival
```

Para restauración real, importar primero a un proyecto de recuperación autorizado, validar sin promover y después cambiar `publication/current` en una transacción administrativa. El rollback de código no revierte automáticamente datos, reglas ni índices; conservar versiones inmutables y promover el puntero solo después de validar. La exportación/importación y Functions pueden tener costo en Blaze.
