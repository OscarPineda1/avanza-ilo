# HU-26 · Compilación, despliegue y respaldo reproducibles

Estado: procedimiento preparado. El despliegue cloud, la publicación real, la instalación en Android objetivo y su video siguen pendientes de autorización/evidencia.

## Compilación local ejecutada el 2026-09-12

- `assembleRelease`: satisfactorio (480 tareas; 169 ejecutadas).
- APK de comprobación: `android/app/build/outputs/apk/release/app-release.apk`, 69,868,697 bytes.
- SHA-256: `CE32F35341A59CC65B7F3D856FCB3838A583D2BC6F091A6DBFEBC9E5B3CB1BC1`.
- Manifest: `com.avanzailo.app`, minSdk 24 (compatible por nivel de API con Android 8/API 26).
- Firma: verificada con APK Signature Scheme v2, usando la configuración de depuración existente; **no es firma de distribución**.
- No había dispositivo conectado, por lo que instalación, inicio frío y flujo contra entorno real permanecen pendientes.
- La configuración local no define todavía un endpoint ETA autorizado; este APK solo demuestra compilación y no es el APK evaluable de cierre.

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

## Despliegue autorizado

Antes de ejecutar, registrar confirmación de `projectId`, app Android, paquete, Blaze, región, secretos/variables, APIs, presupuesto y alertas. Ejecutar con una identidad de mínimo privilegio y revisar el diff de configuración.

```powershell
npx firebase-tools use <PROJECT_ID>
npx firebase-tools deploy --only firestore:rules,firestore:indexes
npx firebase-tools deploy --only functions:eta
$env:GCLOUD_PROJECT='<PROJECT_ID>'
$env:AVANZA_PUBLICATION_RESPONSIBLE='<CODIGO_RESPONSABLE>'
npm --prefix functions run publish:production
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
