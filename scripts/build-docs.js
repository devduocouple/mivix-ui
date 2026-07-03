import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const outputRoot = resolve(repoRoot, 'dist/docs');

async function copyDirectory(source, destination) {
  await cp(source, destination, {
    recursive: true,
    force: true,
    filter: sourcePath => !sourcePath.endsWith('.DS_Store')
  });
}

async function buildDocs() {
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });

  await copyDirectory(resolve(repoRoot, 'docs'), outputRoot);
  await copyDirectory(resolve(repoRoot, 'src'), resolve(outputRoot, 'src'));

  const indexPath = resolve(outputRoot, 'index.html');
  const source = await readFile(indexPath, 'utf8');
  const html = source
    .replaceAll('href="../src/', 'href="./src/')
    .replaceAll('src="../src/', 'src="./src/');

  await writeFile(indexPath, html);
  await writeFile(resolve(outputRoot, '.nojekyll'), '');

  console.log(`Built docs site at ${outputRoot}`);
}

await buildDocs();
