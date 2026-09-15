# HU-22 · Despliegue HTTPS de ETA

Fecha: 2026-09-14
Proyecto: `avanza-ilo`
Región: `us-central1`

## Estado verificado

- Plan Blaze activo.
- Presupuesto global: S/1 mensual, con alertas al 1%, 90% y 100%.
- Límite de inversión de Cloud Run Functions: S/1 mensual, configurado para pausar el servicio al 100%.
- Function `eta`: segunda generación, Node.js 22, estado `ACTIVE`, 256 MiB, concurrencia 20, máximo una instancia y timeout de 15 segundos.
- Limpieza de Artifact Registry: imágenes con más de un día.
- Endpoint configurado en el `.env` local, ignorado por Git.

## Comprobaciones ejecutadas

| Comprobación | Resultado |
| --- | --- |
| Compilación TypeScript previa | Satisfactoria |
| `firebase functions:list` | `eta`, `us-central1`, `ACTIVE` |
| `GET` al endpoint | HTTP 405, `status=invalid_input` |
| `POST {}` sin App Check | HTTP 401, `status=invalid_input` |
| Control de supuestos | `America/Lima`, sin tráfico, ocupación ni rastreo vehicular |

La prueba positiva productiva permanece pendiente de un token App Check emitido para el development build. El snapshot publicado conserva `etaReady=false`; por tanto, aunque la integridad de la app sea válida, no se publicará una llegada calculada hasta cargar pesos y despachos reales validados.
