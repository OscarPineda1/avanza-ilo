# HU-20 · Sentidos y secuencias sin transbordos

- Fecha de validacion: **2026-09-09**
- Catalogo: `avanza-ilo-rutas-piloto`
- Version: `2026-09-09-hu20-circuitos`

## Decision de alcance

La HU-20 se absorbe en las capacidades de consulta, seleccion y calculo existentes. No agrega una pantalla, un servicio pagado ni logica de transbordos.

Cada recorrido publicado se representa como una secuencia dirigida. Una secuencia conserva por separado las capas recibidas de Google My Maps y solo une dos capas consecutivas cuando sus extremos forman una continuidad validada. El grafo usa la posicion dentro de la secuencia como identidad del nodo: compartir una coordenada en un cruce no crea una conexion adicional.

La aclaracion funcional confirma que las rutas 1A, D y 14 empiezan y terminan en el mismo punto. La interseccion antes marcada como final corresponde al inicio del regreso: aparece al completar el lazo local y desde alli se vuelve por el tramo compartido. Por ello cada retorno se declara en su secuencia, reutilizando las coordenadas publicadas en orden inverso solo para el tramo expresamente confirmado.

## Tabla de secuencias

| Ruta | Secuencia | Sentido publicado | Tipo | Capas de secuencia, en orden | Coordenadas | Referencias | Aristas inversas |
| --- | --- | --- | --- | --- | ---: | ---: | ---: |
| 1A | `1a-publicado` | Alto Ilo -> Pampa Inalambrica -> Alto Ilo | Circuito | `1a-tramo-1` -> `1a-tramo-2` -> `1a-retorno-tramo-compartido` | 914 | 9 | 0 |
| D | `d-publicado` | Plaza de Armas -> Ciudad Nueva -> Plaza de Armas | Circuito | `d-trazo-publicado` -> `d-retorno-tramo-compartido` | 1070 | 9 | 0 |
| 14 | `14-publicado` | Mercado Pacocha -> Tren al Sur -> Mercado Pacocha | Circuito | `14-tramo-1` -> `14-tramo-2` -> `14-retorno-tramo-compartido` | 1049 | 9 | 0 |

Los tres retornos quedan respaldados por la aclaracion funcional de HU-20. Cualquier recorrido diferente que se obtenga posteriormente desde otra fuente aprobada debera incorporarse con un identificador y una secuencia independientes.

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
- Consultar desde el cierre posicional hacia el primer nodo devuelve un resultado inalcanzable; el cierre fisico del circuito no crea una arista automatica.
- El constructor del grafo rechaza referencias que pertenezcan a rutas o secuencias distintas.

## Evidencia visible en la aplicacion

- Las tarjetas del inicio, el directorio, los resultados de busqueda y favoritos muestran origen, una flecha discreta y destino, usando el color de la ruta solo como acento.
- El detalle del mapa repite el recorrido antes del ETA sin agregar rotulos tecnicos que no forman parte del diseno base.
- En las rutas 1A, D y 14, el mapa relaciona **I/F · Inicio y fin** con el punto inicial y **R · Regreso** con la interseccion donde comienza el tramo compartido de vuelta. Cada circuito conserva una sola flecha discreta para evitar superposiciones en las calles compartidas.
- La seleccion manual muestra una sola referencia fisica para el inicio y fin del circuito; el nodo de cierre se mantiene en el modelo para calcular la vuelta completa sin duplicarlo en la lista.

No se agrega una segunda ruta de vuelta: ida, lazo local y regreso forman un solo circuito en cada caso. Los retornos confirmados reutilizan el tramo comun y terminan exactamente en la coordenada inicial; no se añaden calles ni conexiones entre rutas.

## Resultado reproducible

Comando de validacion:

```text
npm run validate:catalog
Resumen: 3 rutas, 3 pilotos, 3 secuencias, 8 capas, 3033 coordenadas, 27 referencias y 24 pesos verificados.
Resultado: VALIDO
```

Pruebas ejecutadas con `npm test`: **10 aprobadas, 0 fallidas**. Incluyen el cierre real de las tres rutas piloto, conservacion de capas, calculo dirigido, ausencia de reversos automaticos, circuito/cruce, aislamiento entre rutas y rechazo de circuitos sin cierre explicito.

## Trazabilidad

- Historia: [HU-20 · issue #24](https://github.com/OscarPineda1/avanza-ilo/issues/24)
- Requisitos: RF-20 reducido propuesto · RF-06/07/11 · OE1/OE2
- Alcance relacionado: HU-05/06/10
- Fuente de alcance: `AVANZA_ILO_HU_VALIDADAS_Y_PLAN_OE1_2026-09-08.pdf`, pagina 30
- Modelo de secuencias: `src/services/route-sequences.ts` y `src/services/routes.ts`
- Grafo dirigido: `src/services/graph.ts`
- Seleccion y calculo: `src/screens/StopSelectionScreen.js`, `src/screens/MapScreen.js` y `src/services/eta-core.ts`
- Pruebas: `tests/route-catalog.test.ts`
