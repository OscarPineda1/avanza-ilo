# HU-25 · Protocolo de campo y grupo focal (OE3 posterior)

Estado: instrumentos preparados; ejecución pendiente. No hay participantes, observaciones ni resultados declarados.

## Prerrequisitos de ejecución

- Endpoint desplegado y probado con autorización.
- `dataVersion` congelada, parámetros y fuentes aprobados.
- Rutas, sentidos, puntos y franjas definidos antes de observar.
- Protocolo ético/consentimiento aprobado por el equipo y asesor.
- Conjuntos de calibración y prueba separados antes de ajustar parámetros.

## Registro cuantitativo

Usar `registro-observaciones.csv`. Cada predicción debe escribirse antes del arribo real. No registrar nombre, teléfono, coordenada personal ni identificador de dispositivo. `observer_code` es un seudónimo controlado fuera del repositorio.

Campos clave: ruta, sentido, punto, franja, `dataVersion`, método, momento de registro, llegada estimada, llegada observada, evento extraordinario y pertenencia a `calibration` o `test`. Tiempos ISO 8601 con zona explícita; la operación se interpreta en `America/Lima`.

```powershell
npm run analyze:field -- docs/oe3/registro-observaciones.csv
```

El analizador rechaza predicciones registradas después del arribo y exige datos `set=test`. Reporta N, MAE, RMSE, sesgo (estimado menos observado), error absoluto máximo y cobertura dentro de cinco minutos; agrupa por ruta, sentido y franja, y separa observaciones ordinarias de eventos extraordinarios. Un CSV vacío debe fallar: no es evidencia.

## Grupo focal

1. Definir criterios de selección y número de participantes con el asesor.
2. Obtener consentimiento y asignar códigos anónimos.
3. Moderar con `guia-grupo-focal.md`, registrar audio/notas solo si fue autorizado y mantenerlos fuera del repositorio público.
4. Codificar cada intervención en `matriz-codificacion.csv`, permitiendo más de un código por fragmento.
5. Comparar temas, casos negativos y diferencias entre participantes; conservar citas breves anonimizadas.
6. Reportar el grupo focal como técnica cualitativa. Si se aplica SUS, analizarlo por separado y no usarlo como sustituto.

## Evidencia de cierre posterior

- Registros originales anonimizados y hash del archivo congelado.
- Salida reproducible del analizador y versión del código.
- Consentimientos custodiados fuera de Git.
- Guía aplicada, bitácora del moderador, matriz de codificación y síntesis temática.
- Limitaciones de muestra, clima, interrupciones, horarios y cualquier desviación.
