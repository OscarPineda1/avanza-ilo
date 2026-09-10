# Defensa del OE1 - Modelo estimativo de llegada sin telemetría

## Objetivo defendido

> Diseñar un modelo estimativo basado en lógicas de inferencia que permita calcular los tiempos de llegada (ETA) de las unidades de transporte urbano de manera funcional ante la ausencia de hardware telemático.

La solución no rastrea un bus. Infiere su posible llegada combinando cuatro elementos: recorrido dirigido, peso temporal de cada segmento, punto donde espera el pasajero y patrón temporal de despachos. El motor se ejecuta localmente; Firebase no forma parte de la demostración de OE1.

## Cadena de inferencia

```text
Coordenadas ordenadas
        ↓ Haversine
Distancia por segmento
        ↓ perfil temporal
Peso en segundos
        ↓ Dijkstra
Tiempo desde el inicio hasta el punto de espera
        ↓ despachos + intervalo
Llegadas candidatas al punto
        ↓ primera llegada >= hora de consulta
ETA y hora estimada
```

## Fórmulas implementadas

### 1. Distancia del segmento

Para dos coordenadas consecutivas se usa Haversine:

```text
a = sen²(Δlat/2) + cos(lat1) · cos(lat2) · sen²(Δlon/2)
d(i,j) = 2R · atan2(√a, √(1-a))
```

`d(i,j)` queda expresada en metros.

### 2. Peso temporal de la arista

```text
w(i,j) = d(i,j) / (v · 1000/3600) + parada(j) · p · 60
```

- `v`: velocidad media del perfil en km/h.
- `p`: penalidad de detención en minutos.
- `parada(j)`: 1 si la arista llega a una parada declarada; 0 en otro caso.
- `w(i,j)`: segundos de recorrido.

Perfil vigente: `ilo-dia-base-v1`, `v = 25 km/h`, `p = 0`. Es un supuesto técnico provisional marcado como `assumption`; no es una velocidad medida en campo.

### 3. Tiempo al punto de espera

Dijkstra suma los pesos mínimos desde el nodo inicial. Si el pasajero toca una posición interior de una arista:

```text
T(punto) = [distanciaDijkstra(inicio, i) + fracción · w(i,j)] / 60
```

El resultado queda en minutos. Las aristas solo avanzan en la secuencia publicada; no se crea el recorrido inverso.

### 4. Salidas y llegadas candidatas - HU-16

```text
salida(k) = referenciaDespacho + k · intervalo
llegada(k,punto) = salida(k) + T(punto)
k* = primer k tal que llegada(k,punto) >= horaConsulta
ETA = llegada(k*,punto) - horaConsulta
```

La comparación se realiza sobre la llegada, no sobre la salida. Por ello una unidad que salió antes de la consulta todavía puede ser la elegida.

### 5. Regla de respaldo sin fase temporal

Cuando solo se conoce la frecuencia, pero no una referencia de despacho sustentada:

```text
esperaPromedio = intervalo / 2
```

Eso se presenta como espera promedio, no como próxima llegada exacta. Fuera del periodo declarado se devuelve `out-of-service`.

## Pesos actuales del catálogo

| Ruta | Nodos | Aristas/pesos | Longitud del circuito | Tiempo base completo | Servicio declarado | Frecuencia | Respaldo H/2 |
| --- | ---: | ---: | ---: | ---: | --- | ---: | ---: |
| 1A | 914 | 913 | 25.38 km | 60.9 min | 06:00-21:00 | 10 min | 5 min |
| D | 1070 | 1069 | 25.73 km | 61.8 min | 06:15-20:45 | 12 min | 6 min |
| 14 | 1049 | 1048 | 27.48 km | 66.0 min | 06:00-21:00 | 15 min | 7.5 min |

Los 3030 pesos se calculan sobre 3033 coordenadas. Las duraciones completas son salidas del modelo base, no observaciones de campo ni tiempos garantizados.

## Caso determinista para demostrar HU-16

Supuesto sintético del informe: `A → B → C → D`, tiempo acumulado hasta C de 5 minutos, salidas 07:00/07:10/07:20 y consulta 07:12.

| Salida | Llegada a C | ¿Ya había salido a las 07:12? | Decisión |
| --- | --- | --- | --- |
| 07:00 | 07:05 | Sí | Descartada: ya pasó |
| 07:10 | 07:15 | Sí | Elegida: primera llegada no anterior |
| 07:20 | 07:25 | No | Posterior |

Resultado: `ETA = 07:15 - 07:12 = 3 minutos`. La fila elegida prueba que no se corta una unidad todavía en recorrido.

## Correspondencia con el código

| Etapa | Implementación |
| --- | --- |
| Distancias | `src/services/haversine.ts` |
| Pesos y grafo dirigido | `buildDirectedRouteGraph` en `src/services/graph.ts` |
| Camino mínimo | `dijkstra` y `shortestPath` en `src/services/graph.ts` |
| Tiempo hasta el punto | `travelMinutesToPosition` en `src/services/eta-core.ts` |
| Candidatos HU-16 | `buildArrivalCandidates` en `src/services/eta-core.ts` |
| Selección y ETA HU-17 | `inferArrivalFromService` y `computeEta` en `src/services/eta-core.ts` |
| Calibración HU-18 | `calibrateTravelProfile` en `src/services/travel-calibration.ts` |
| Evidencia automática | `tests/oe1-core.test.ts`, `tests/route-catalog.test.ts` y `scripts/demo-arrival.ts` |

## Demostración en vivo

```powershell
npm run verify
npm run demo:arrival
```

`verify` valida tipos, casos del modelo y catálogo. `demo:arrival` imprime la tabla de tres candidatos y comprueba automáticamente la llegada 07:15 y el ETA de 3 minutos.

En la aplicación real, mañana ocurrirá lo siguiente:

- Dentro del horario declarado: se mostrará `Espera promedio estimada`, porque la fase de despacho real sigue sin observarse.
- Fuera del horario declarado: se mostrará `Servicio no disponible`.
- Con una fase de despacho cargada y sustentada: el mismo motor mostrará una hora de llegada y el ETA de la primera unidad candidata.

## Qué se puede afirmar

- Existe un modelo funcional y reproducible de ETA sin GPS ni telemetría.
- El recorrido conserva dirección, circuito y punto de espera.
- HU-16 considera unidades ya despachadas.
- El cálculo distingue ETA, espera promedio, fuera de servicio y datos incompatibles.
- El núcleo funciona localmente; Firebase no es necesario para probar OE1.

## Qué todavía no se debe afirmar

- Que 25 km/h sea la velocidad real de las rutas.
- Que las unidades salgan exactamente según las frecuencias declaradas.
- Que el resultado tenga precisión de ±5 minutos.
- Que exista ubicación vehicular, tráfico en vivo o Firebase desplegado.

## Respuesta corta para preguntas del jurado

**¿Cómo calculan ETA sin GPS?**
Usamos la geometría publicada para estimar el tiempo al punto y una fase de despachos para proyectar llegadas candidatas. Elegimos la primera que aún no pasó.

**¿Por qué usan 25 km/h?**
Es un parámetro base explícito para verificar el funcionamiento matemático. HU-18 permite reemplazarlo con velocidad calculada de observaciones reales y mantener un conjunto distinto para probar precisión.

**¿Frecuencia/2 es el ETA?**
No. Solo es espera promedio cuando falta la fase temporal. El ETA exacto del modelo requiere referencia de despacho; la interfaz distingue ambos resultados.

**¿Dónde entra Dijkstra?**
Obtiene el costo temporal mínimo dirigido desde el inicio hasta el segmento donde espera el pasajero y permite reconstruir el camino usado.

**¿Firebase ya está desarrollado?**
No. El núcleo de OE1 es local y determinista. Firebase puede incorporarse después para distribuir datos, pero no sustituye ni define la fórmula del modelo.

## Guion de cierre

> No afirmamos que conocemos la posición del bus. Diseñamos una inferencia auditable: convertimos la ruta en un grafo dirigido, asignamos a cada tramo un peso temporal, calculamos el tiempo al punto de espera y lo cruzamos con despachos candidatos. HU-16 evita ignorar buses que ya salieron. Hoy demostramos el algoritmo con un reloj controlado y separamos claramente el supuesto de 25 km/h de la futura calibración de campo. Así el OE1 queda funcional, reproducible y honesto frente a la ausencia de telemetría.
