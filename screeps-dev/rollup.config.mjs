import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// Define the arenas and their corresponding input/output paths
const arenas = [
  {
    name: 'spawn_and_swamp',
    input: 'src/arenas/season4-spawn_and_swamp/main.ts',
    outputDir: path.resolve('..', 'season4-spawn_and_swamp')
  },
  {
    name: 'escort_run',
    input: 'src/arenas/season4-escort_run/main.ts',
    outputDir: path.resolve('..', 'season4-escort_run')
  }
];

/**
 * Custom Rollup plugin that compares MD5 hashes of the new bundle
 * vs the existing main.mjs. If unchanged, it cancels disk writing
 * so Screeps Arena does not increment your code version.
 */
function smartPushPlugin(outputPath) {
  return {
    name: 'smart-push',
    generateBundle(options, bundle) {
      const fileName = Object.keys(bundle)[0];
      const chunk = bundle[fileName];

      if (chunk && chunk.type === 'chunk') {
        const targetFile = path.join(outputPath, 'main.mjs');

        if (fs.existsSync(targetFile)) {
          const existingCode = fs.readFileSync(targetFile, 'utf8');
          const existingHash = crypto.createHash('md5').update(existingCode).digest('hex');
          const newHash = crypto.createHash('md5').update(chunk.code).digest('hex');

          if (existingHash === newHash) {
            console.log(`\x1b[33m[${path.basename(outputPath)}]\x1b[0m Unchanged. Skipped write.`);
            delete bundle[fileName];
            return;
          }
        }

        console.log(`\x1b[32m[${path.basename(outputPath)}]\x1b[0m Code updated. Deploying build...`);
      }
    }
  };
}

export default (commandLineArgs) => {
  const targetArena = commandLineArgs.configArena;
  delete commandLineArgs.configArena; // Prevent Rollup warning on custom flag

  const activeArenas = targetArena
    ? arenas.filter(a => a.name === targetArena)
    : arenas;

  return activeArenas.map(arena => ({
    input: arena.input,
    output: {
      dir: arena.outputDir,
      entryFileNames: 'main.mjs',
      format: 'es',
      sourcemap: 'inline'
    },
    external: [/^game(\/.*)?$/, /^arena(\/.*)?$/],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' }),
      smartPushPlugin(arena.outputDir)
    ]
  }));
};