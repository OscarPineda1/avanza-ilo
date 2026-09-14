import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import { buildOe2ResearchData } from '../src/services/oe2-research-data';

async function main(): Promise<void> {
  const outputPath = resolve(
    process.argv[2] ?? 'outputs/avanza-ilo-datos-20260913/oe2-datos-derivados.json'
  );

  await mkdir(dirname(outputPath), { recursive: true });
  const data = buildOe2ResearchData();
  await writeFile(outputPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');

  console.log(
    `OE2: ${data.routes.length} rutas, ${data.geometry.length} coordenadas, ` +
      `${data.references.length} referencias y ${data.circuits.length} circuitos exportados.`
  );
  for (const circuit of data.circuits) {
    console.log(
      `${circuit.routeCode}: ${circuit.coordinateCount} coordenadas, ` +
        `${circuit.circuitLengthMeters.toFixed(1)} m, cierre ` +
        `${circuit.closesExactly ? 'exacto' : 'pendiente'} ` +
        `(${circuit.closureDistanceMeters.toFixed(3)} m).`
    );
  }
  console.log(`Archivo: ${outputPath}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
