# Avanza Ilo

Prueba de concepto móvil para consultar los circuitos piloto 1A, D y 14, elegir un punto de espera y solicitar una estimación cloud sin telemetría vehicular.

## Alcance actual

- Snapshot publicado y versionado en Firestore con rutas, secuencias, referencias, horario, frecuencia y fuente.
- Última caché íntegra para orientación estática sin conexión; el ETA queda desactivado.
- Circuitos dirigidos completos; un cruce no crea conexiones ni recorridos inversos.
- Selección manual de una referencia o de un punto sobre la polilínea, sin requerir GPS.
- Grafo dirigido y Dijkstra sobre la secuencia completa.
- Cloud Function HTTPS que ejecuta el motor temporal y elige llegadas candidatas cuando existe una fase de despacho sustentada.
- Suite reproducible que incluye el ejemplo sintético 07:12 → 07:15.

Los datos reales actuales no incluyen una fase de despacho validada. La interfaz muestra **espera promedio estimada** (`frecuencia ÷ 2`) y no inventa una próxima unidad, posición GPS ni precisión ±5 minutos.

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
```

`verify` ejecuta TypeScript, pruebas de app/algoritmo/Function y validación del catálogo. `test:emulators` comprueba Firestore, reglas y el endpoint con datos aislados. La arquitectura y los pasos pendientes de producción están en `docs/arquitectura-cloud.md`.

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
