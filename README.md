# Avanza Ilo

Prueba de concepto móvil para consultar los circuitos piloto 1A, D y 14, elegir un punto de espera y ejecutar un modelo estimativo sin telemetría vehicular.

## Alcance actual

- Catálogo local versionado con rutas, secuencias, referencias, horario, frecuencia y fuente.
- Circuitos dirigidos completos; un cruce no crea conexiones ni recorridos inversos.
- Selección manual de una referencia o de un punto sobre la polilínea, sin requerir GPS.
- Grafo dirigido y Dijkstra sobre la secuencia completa.
- Motor temporal capaz de elegir llegadas candidatas cuando existe una fase de despacho sustentada.
- Suite reproducible que incluye el ejemplo sintético 07:12 → 07:15.

Los datos reales actuales no incluyen una fase de despacho validada. La interfaz muestra **espera promedio estimada** (`frecuencia ÷ 2`) y no inventa una próxima unidad, posición GPS ni precisión ±5 minutos.

## Requisitos

- Node.js 20.19.4 o superior.
- Expo SDK 54 / Expo Go compatible.

## Ejecución

```powershell
Copy-Item .env.example .env
npm ci
npx expo start -c
```

Completa las claves de Google Maps solo en `.env`. Ese archivo no se versiona.

## Verificación

```powershell
npm run verify
npm run demo:arrival
```

`verify` ejecuta TypeScript, las pruebas del núcleo y la validación del catálogo. La evidencia, las fórmulas y el guion de defensa de OE1 están en `docs/evidencias/OE1-defensa-modelo-estimativo.md`.

## Estructura

```text
src/
├── components/   interfaz reutilizable
├── navigation/   navegación de pantallas
├── screens/      búsqueda, mapa y selección
├── services/     catálogo, grafo, ETA, calibración y validación
├── styles/       tema visual
└── utils/        geometrías publicadas
tests/            casos reproducibles del núcleo
scripts/          validación y demostración del modelo
docs/evidencias/  decisiones, resultados y límites
```

Consulta [CONTRIBUTING.md](CONTRIBUTING.md) antes de crear commits.
