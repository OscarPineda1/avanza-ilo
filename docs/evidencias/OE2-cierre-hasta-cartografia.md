# OE2 · Cierre verificable hasta cartografía y estructura ETA

Fecha de corte: 2026-09-14. Este documento delimita lo alcanzado sin presentar como reales datos que todavía requieren fuente externa.

## Decisión de circuito

El responsable de datos confirmó que, para las rutas piloto 1A, D y 14, el punto final de la secuencia es el mismo punto inicial. El catálogo representa ese cierre con dos posiciones del grafo —inicio y cierre— que comparten exactamente latitud y longitud. Así se conserva la vuelta completa sin crear una arista artificial desde el último nodo hacia el primero.

La prueba `OE2/HU-20` verifica en las tres rutas que la igualdad es exacta y que la distancia física entre ambos extremos es 0 m.

## Alcance alcanzado en OE2

- Catálogo piloto restringido a 1A, D y 14; la contradicción 12/14 está resuelta a favor de 14 en la fuente vigente.
- Secuencias dirigidas, capas de ida/lazo/retorno y cierre explícito del circuito.
- Coordenadas, referencias visuales y distancias Haversine reproducibles mediante `npm run export:oe2-data`.
- Firestore activo como fuente maestra de la cartografía publicada, con `cartographyReady=true` y `etaReady=false`.
- Grafo, Dijkstra, perfiles temporales, generación de llegadas candidatas, contrato HTTPS y pruebas locales/emuladas preparados.
- Aplicación conectada a Firestore y al endpoint HTTPS; al no existir datos temporales aprobados, no muestra un ETA provisional ni conserva uno al perder conexión.

## Límite metodológico

Las coordenadas permiten calcular distancias geométricas, orden de nodos y cierre del circuito. No permiten deducir por sí solas tiempos reales de tramo, velocidad operativa, frecuencia, horario o despachos. Esos campos permanecen como supuestos identificados o pendientes y no habilitan el ETA productivo.

MAE, RMSE, sesgo, cobertura dentro del umbral, observaciones de llegada y grupo focal pertenecen a la ejecución posterior de OE3/HU-25. Los instrumentos quedan preparados, pero no se declaran resultados.

## Evidencia reproducible

```powershell
npm run export:oe2-data
npm run verify
```

El archivo exportado alimenta el Excel de recolección separando cartografía publicada, cálculos derivados, datos operativos provisionales y evidencia externa pendiente.
