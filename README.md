# Avanza Ilo

Aplicación móvil Expo para consultar las rutas 1A, D y 14, sus paraderos oficiales y el tiempo estimado de llegada mediante Firebase.

## Desarrollo rápido en Android

El proyecto usa módulos nativos de Firebase, por lo que debe abrirse con un development build y no con Expo Go.

```powershell
npm ci
npm run build:development
```

Instala una sola vez el APK de desarrollo generado por EAS. Para ver los cambios posteriores en tiempo real:

```powershell
npm start
```

Abre Avanza Ilo en el celular y escanea el QR, o presiona `a` para abrirla en el emulador de Android Studio. Los cambios de JavaScript y estilos usan recarga rápida; únicamente los cambios de configuración o dependencias nativas exigen crear otro development build.

La configuración local permanece en `.env` y `google-services.json`, ambos fuera de Git. Las compilaciones EAS leen las variables del entorno configurado en Expo.

## Comandos

```powershell
npm run verify             # valida app, catálogo y Cloud Functions
npm run test:emulators     # prueba la integración aislada con Firebase
npm run android            # compila y abre localmente en un emulador conectado
npm run build:apk          # genera el APK de producción
```

## Estructura

```text
src/
├── components/       componentes visuales reutilizables
├── context/          estado compartido de la aplicación
├── data/routes/      geometrías oficiales de las rutas
├── navigation/       navegación principal
├── screens/          pantallas de la aplicación
├── services/         catálogo, ubicación, caché, Firebase y ETA
└── styles/           tema visual
functions/            Cloud Function y motor ETA del servidor
scripts/              validación del catálogo
tests/                pruebas de la aplicación e integración
```
