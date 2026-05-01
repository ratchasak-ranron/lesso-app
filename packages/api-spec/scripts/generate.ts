import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import openapiTS, { astToString } from 'openapi-typescript';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SPEC = resolve(__dirname, '../openapi.yaml');
const OUT_DIR = resolve(__dirname, '../../domain/src/generated');
const OUT_FILE = resolve(OUT_DIR, 'api.d.ts');

async function main(): Promise<void> {
  const ast = await openapiTS(new URL(`file://${SPEC}`));
  const contents = astToString(ast);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, contents, 'utf8');
  console.log(`Generated ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
