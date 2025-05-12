import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  write: true,
  platform: "node",
  target: "node20",
  outdir: 'dist',
  external: ['@aws-sdk/*']
});
