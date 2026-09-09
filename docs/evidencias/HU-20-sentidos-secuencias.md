# HU-20 · Sentidos y secuencias sin transbordos

- Fecha de validacion: **2026-09-09**
- Catalogo: `avanza-ilo-rutas-piloto`
- Version: `2026-09-09-hu20`

## Decision de alcance

La HU-20 se absorbe en las capacidades de consulta, seleccion y calculo existentes. No agrega una pantalla, un servicio pagado ni logica de transbordos.

Cada recorrido publicado se representa como una secuencia dirigida. Una secuencia conserva por separado las capas recibidas de Google My Maps y solo une dos capas consecutivas cuando sus extremos forman una continuidad validada. El grafo usa la posicion dentro de la secuencia como identidad del nodo: compartir una coordenada en un cruce no crea una conexion adicional.

## Tabla de secuencias

| Ruta | Secuencia | Sentido publicado | Tipo | Capas My Maps, en orden | Coordenadas | Referencias | Aristas inversas |
| --- | --- | --- | --- | --- | ---: | ---: | ---: |
| 1A | `1a-publicado` | Alto Ilo hacia Pampa Inalambrica | Dirigido | `1a-tramo-1` -> `1a-tramo-2` | 590 | 9 | 0 |
| D | `d-publicado` | Plaza de Armas hacia Ciudad Nueva | Dirigido | `d-trazo-publicado` | 659 | 8 | 0 |
| 14 | `14-publicado` | Mercado Pacocha hacia Tren al Sur | Dirigido | `14-tramo-1` -> `14-tramo-2` | 663 | 9 | 0 |

No se deduce un sentido de retorno. Si posteriormente se obtiene otro sentido desde una fuente aprobada, debe incorporarse con un identificador y una secuencia independientes.

## Prueba de circuito y cruce

La prueba automatizada construye un circuito minimo con tres posiciones `0 -> 1 -> 2`, donde las posiciones `0` y `2` comparten la misma coordenada. El resultado conserva tres nodos posicionales y exactamente dos aristas consecutivas:

```text
0 -> 1
1 -> 2
```

No se crean las aristas `0 -> 2`, `2 -> 0`, `1 -> 0` ni `2 -> 1`. Una prueba adicional mezcla una referencia de la ruta 1A con otra de la ruta D y comprueba que el constructor del grafo rechaza el conjunto, en vez de crear una conexion entre rutas.

El validador tambien rechaza como circuito cualquier secuencia cuyo cierre no aparezca explicitamente en la geometria fuente.

## Seleccion y calculo

- Cada referencia incluye `routeName` y `sequenceId`.
- La navegacion conserva `sequenceId` desde el listado o mapa hasta la seleccion manual y el detalle.
- El calculo de ETA busca origen y destino dentro de la misma secuencia.
- Consultar desde el ultimo nodo hacia el primero devuelve un resultado inalcanzable; no se inventa el recorrido inverso.
- El constructor del grafo rechaza referencias que pertenezcan a rutas o secuencias distintas.

## Resultado reproducible

Comando de validacion:

```text
npm run validate:catalog
Resumen: 3 rutas, 3 pilotos, 3 secuencias, 5 capas, 1912 coordenadas, 26 referencias y 23 pesos verificados.
Resultado: VALIDO
```

Pruebas ejecutadas con `npm test`: **9 aprobadas, 0 fallidas**. Incluyen conservacion de capas, calculo dirigido, ausencia de reversos, circuito/cruce, aislamiento entre rutas y rechazo de circuitos sin cierre explicito.

## Trazabilidad

- Historia: [HU-20 · issue #24](https://github.com/OscarPineda1/avanza-ilo/issues/24)
- Requisitos: RF-20 reducido propuesto · RF-06/07/11 · OE1/OE2
- Alcance relacionado: HU-05/06/10
- Fuente de alcance: `AVANZA_ILO_HU_VALIDADAS_Y_PLAN_OE1_2026-09-08.pdf`, pagina 30
- Modelo de secuencias: `src/services/route-sequences.ts` y `src/services/routes.ts`
- Grafo dirigido: `src/services/graph.ts`
- Seleccion y calculo: `src/screens/StopSelectionScreen.js`, `src/screens/MapScreen.js` y `src/services/eta-core.ts`
- Pruebas: `tests/route-catalog.test.ts`
