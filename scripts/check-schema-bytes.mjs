import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { basename } from 'node:path';

const schemaDirectory = new URL('../public/schemas/', import.meta.url);
const expected = new Map([
  [
    'decision-v1.schema.json',
    '247850adc05530a6bb5a33fc3042b95e2d1196339eae07f528ed022bb5188bfb',
  ],
  [
    'evidence-v1.schema.json',
    '607e0d0503bf68c6a3a2083d3591c8005f8225922af731c1f43ce7040b087f3d',
  ],
  [
    'policy-v1.schema.json',
    '17f5a0dc1d17e41eea00d41d069bb52480f660dc467e0e6020c743b237fb57a0',
  ],
  [
    'subject-v1.schema.json',
    'fc944cfce14e68fed22774cdf950d3d8ca09bb5f34446aaa380484e3c832dd59',
  ],
  [
    'waiver-v1.schema.json',
    '01e45174609131b0d3f3a85b316f600858faa010fd065e9bac11b783c1934fdb',
  ],
]);

const actualNames = (await readdir(schemaDirectory))
  .filter((name) => name.endsWith('.schema.json'))
  .sort();
const expectedNames = [...expected.keys()].sort();

if (JSON.stringify(actualNames) !== JSON.stringify(expectedNames)) {
  throw new Error(
    `schema set mismatch: expected ${expectedNames.join(', ')}, got ${actualNames.join(', ')}`,
  );
}

for (const [name, expectedDigest] of expected) {
  const bytes = await readFile(new URL(name, schemaDirectory));
  const actualDigest = createHash('sha256').update(bytes).digest('hex');
  if (actualDigest !== expectedDigest) {
    throw new Error(
      `${basename(name)} changed bytes: expected ${expectedDigest}, got ${actualDigest}`,
    );
  }
}

console.log(
  `Verified ${expected.size} canonical verifier v0.1.0 schema files byte-for-byte.`,
);
