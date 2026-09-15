# OE1/OE2 · cierre técnico para demostración

Fecha de corte: 2026-09-14.

## Resultado

Las HU de OE1 y OE2 quedan implementadas y reproducibles para revisión de Joshua. El flujo de demostración usa el snapshot aislado `2026-09-14-demo-oe1-oe2-v1` y conserva la arquitectura aprobada: aplicación móvil → Function HTTPS → motor ETA → Firestore → respuesta.

Este cierre es técnico, no una validación de campo. Los despachos y pesos se clasifican como `synthetic` en el contrato y el publicador rechaza `--scenario=demo` cuando el destino es producción.

| HU | Estado para revisión | Evidencia principal |
| --- | --- | --- |
| HU-01 | Lista | inicio instrumentado sin datos personales; prueba `HU-01/24` |
| HU-02 | Lista | buscador normalizado y prueba `HU-02` |
| HU-03 | Lista | navegación y detalle conservados en la interfaz aprobada |
| HU-04 | Lista | exploración del catálogo publicado y estados vacíos controlados |
| HU-05 | Lista | cartografía 1A, D y 14, circuitos y capas validadas |
| HU-06 | Lista | selección sobre polilínea y distinción ida/regreso |
| HU-07 | Lista | punto de espera manual; nombres por kilometraje, sin rótulos genéricos |
| HU-08 | Lista | Firestore maestro, snapshot íntegro y caché validada |
| HU-09 | Lista | favoritos persistentes y normalización probada |
| HU-10 | Lista | 3,030 aristas dirigidas con pesos finitos en segundos |
| HU-11 | Lista | Dijkstra y costo hasta el punto de espera |
| HU-12 | Lista | cliente HTTPS, App Check, conectividad y ETA inválido offline |
| HU-13 | Lista | estados sin conexión y caché estática, sin ETA obsoleto |
| HU-14 | Lista | ficha consume únicamente maestros publicados; faltantes oficiales se muestran como pendientes |
| HU-15 | Lista para demo | perfiles temporales versionados; requieren calibración real para producción |
| HU-16 | Lista para demo | 360 despachos y generación de llegadas candidatas, incluidas unidades ya salidas |
| HU-17 | Lista para demo | ETA estructurado y estados controlados desde la Function |
| HU-18 | Lista técnicamente | pesos simulados y calibrador implementado; observaciones reales pendientes |
| HU-19 | Lista | catálogo restringido a 1A, D y 14; conflicto 12/14 resuelto |
| HU-20 | Lista | secuencias y cierre exacto de los tres circuitos |
| HU-21 | Lista | interfaz existente conectada al estado publicado, sin rediseño |
| HU-22 | Lista | Function `eta` desplegada en `us-central1`; demo positiva en emuladores |
| HU-23 | Lista | pruebas unitarias, contrato y recorrido integral en emuladores |
| HU-24 | Parcial | controles de errores y seguridad implementados; medición RNF en build comparable a producción pendiente |

HU-25 permanece en OE3: protocolo preparado, sin participantes ni resultados fabricados. HU-26 es cierre reproducible final y no se adelanta aquí.

## Datos del escenario

- 3 rutas y 3 secuencias.
- 3,033 coordenadas cartográficas existentes.
- 3,030 pesos simulados, finitos y no negativos, con unidad `seconds`, perfil y fuente.
- 360 despachos simulados con fase temporal y zona `America/Lima`.
- 9 consultas de muestra, sin completar llegada observada ni métricas OE3.
- 27 ubicaciones de espera expresadas por origen/cierre o kilómetro acumulado; se retiró “Punto de referencia N”.

## Verificación Android

- Development build instalado en un emulador Android con `expo-dev-client`.
- Firestore emulado cargó las 3 rutas y el snapshot `2026-09-14-demo-oe1-oe2-v1`.
- La ficha de Ruta 1A mostró `LLEGADA ESTIMADA` y `5.3 min`; la Function registró la ejecución HTTPS.
- Recarga de desarrollo medida en `app_ready_ms=1511`. No se usa como evidencia final de HU-24 porque no es un build comparable a producción.

## Reproducción

```powershell
npm run verify
npm run test:emulators
npm run test:demo:emulators
npm run demo:export
```

Para la presentación:

```powershell
# Terminal 1
npm run demo:emulators

# Terminal 2
npm run demo:app
```

La publicación real `2026-09-14-cartografia-v2` no se modifica: mantiene `cartographyReady=true` y `etaReady=false` hasta sustituir los dos conjuntos simulados por evidencia operativa.
