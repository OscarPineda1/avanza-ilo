# Avanza Ilo

Prueba de concepto móvil para consultar los circuitos piloto 1A, D y 14, elegir un punto de espera y solicitar una estimación cloud sin telemetría vehicular.

## Alcance actual

- Snapshot cartográfico publicado y versionado en Firestore con rutas, secuencias, referencias y fuente.
- Última caché íntegra para orientación estática sin conexión; el ETA queda desactivado.
- Circuitos dirigidos completos; un cruce no crea conexiones ni recorridos inversos.
- Selección manual de una referencia o de un punto sobre la polilínea, sin requerir GPS.
- Grafo dirigido y Dijkstra sobre la secuencia completa.
- Cloud Function HTTPS que ejecuta el motor temporal y elige llegadas candidatas cuando existe una fase de despacho sustentada.
- Suite reproducible que incluye el ejemplo sintético 07:12 → 07:15.

Los datos productivos actuales no incluyen pesos temporales ni una fase de despacho validados. Por eso producción conserva la cartografía y muestra el ETA como no disponible. Para exposiciones existe un escenario separado de demostración, bloqueado para publicación productiva, que activa el flujo completo con despachos y pesos simulados sin afirmar posición GPS ni precisión de campo.

## Requisitos

- Node.js 20.19.4 o superior.
- Expo SDK 54; la interfaz puede revisarse en Expo Go, pero Firebase App Check nativo requiere un development/release build.

## Ejecución

```powershell
Copy-Item .env.example .env
npm ci
npx expo start -c
```

Completa la configuración pública de Firebase, el endpoint autorizado y Maps solo en `.env`. Ese archivo no se versiona.

## Verificación

```powershell
npm run verify
npm run test:emulators
npm run demo:arrival
npm run test:demo:emulators
```

`verify` ejecuta TypeScript, pruebas de app/algoritmo/Function y validación del catálogo. `test:emulators` comprueba Firestore, reglas y el endpoint con datos aislados. La arquitectura y los pasos pendientes de producción están en `docs/arquitectura-cloud.md`.

## Presentación con ETA activo

El emulador conserva exactamente el flujo `app → Function HTTPS → motor ETA → Firestore → respuesta`. No publica datos simulados en el proyecto real.

```powershell
# Terminal 1
npm run demo:emulators

# Terminal 2, con el emulador Android abierto y el development build instalado
npm run demo:app
```

El snapshot `2026-09-14-demo-oe1-oe2-v1` cubre todo el día para evitar un falso “fuera de servicio” durante la exposición. Sus únicos datos operativos agregados son despachos y pesos temporales simulados; empresa y tarifa continúan como pendientes en los maestros productivos.

## Estructura

```text
src/
├── components/   interfaz reutilizable
├── navigation/   navegación de pantallas
├── screens/      búsqueda, mapa y selección
├── services/     catálogo, caché, cliente ETA, calibración y validación
├── styles/       tema visual
└── utils/        geometrías publicadas
tests/            casos reproducibles del núcleo
functions/        endpoint HTTPS y motor ETA ejecutado en servidor
scripts/          validación y demostración del modelo
docs/evidencias/  decisiones, resultados y límites
```

Consulta [CONTRIBUTING.md](CONTRIBUTING.md) antes de crear commits.
