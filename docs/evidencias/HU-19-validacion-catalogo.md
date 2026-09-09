# HU-19 · Validacion del catalogo de rutas

- Fecha de validacion: **2026-09-09**
- Catalogo: `avanza-ilo-rutas-piloto`
- Version: `2026-09-09`

## Decision documentada

El trazo incorporado el 2026-08-19 con la etiqueta **ruta 12** corresponde en realidad a la **ruta 14**. La correccion se aplica de la siguiente manera:

- Se conserva el ID `4`, que ya identificaba a la ruta 14 en el catalogo.
- Se asigna a la ruta 14 el trazo previamente etiquetado como ruta 12, sin modificar su secuencia de coordenadas.
- Se retira la entrada ruta 12 y su archivo auxiliar antiguo; no se reutiliza el ID `3` para evitar una migracion silenciosa.
- El catalogo piloto aprobado queda compuesto exclusivamente por `1A`, `D` y `14`.

- Fuente de geometria: **Google My Maps**, captura registrada en los archivos de trazado el 2026-08-19.
- Fuente de correccion: **responsable de datos del proyecto**, decision registrada para la HU-19 el 2026-09-09.

## Alcance de la validacion

El comando `npm run validate:catalog` comprueba antes de utilizar o guardar el catalogo:

1. Pilotos aprobados exactamente iguales a 1A, D y 14.
2. IDs y codigos de ruta unicos.
3. Fuente, fecha, version y decision documentadas.
4. Origen, destino, sentido y frecuencia positiva en cada piloto.
5. Coordenadas finitas, dentro del entorno de Ilo y en una secuencia sin saltos invalidos.
6. Puntos de referencia con IDs unicos, orden consecutivo y correspondencia con el sentido del trazo.
7. Pesos de los segmentos finitos y mayores que cero.

Los puntos generados son referencias matematicas sobre el trazo; este reporte no los presenta como paraderos oficiales.

## Resultado reproducible

```text
Pilotos aprobados: 1A, D, 14
Resumen: 3 rutas, 3 pilotos, 1912 coordenadas, 26 referencias y 23 pesos verificados.
Resultado: VALIDO
```

Pruebas ejecutadas con `npm test`:

- El catalogo contiene exclusivamente los pilotos 1A, D y 14 y conserva `id: 4` para la ruta 14.
- El conjunto maestro supera todas las reglas de integridad.
- IDs duplicados y geometria incompleta son rechazados.
- Un conjunto invalido no reemplaza al ultimo catalogo integro guardado.

## Trazabilidad

- Historia: [HU-19 · issue #23](https://github.com/OscarPineda1/avanza-ilo/issues/23)
- Requisitos: RF-19 reducido propuesto · RNF-16 minimo · OE1
- Archivos maestros: `src/services/routes.ts` y `src/utils/ruta14-my-maps.js`
- Validador: `src/services/route-catalog-validation.ts`
- Proteccion de ultima copia integra: `src/services/route-cache-core.ts`
