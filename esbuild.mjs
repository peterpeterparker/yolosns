import esbuild from "esbuild";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "fs";
import { join } from "path";

const dist = join(process.cwd(), "dist");

const createDistFolder = () => {
  if (!existsSync(dist)) {
    mkdirSync(dist);
  }
};

const buildEsmCjs = () => {
  const entryPoints = readdirSync(join(process.cwd(), "src"))
    .filter(
      (file) =>
        !file.includes("test") &&
        !file.includes("spec") &&
        !file.endsWith(".swp") &&
        statSync(join(process.cwd(), "src", file)).isFile(),
    )
    .map((file) => `src/${file}`);

  // esm output bundles with code splitting
  esbuild
    .build({
      entryPoints,
      outdir: "dist/esm",
      bundle: true,
      sourcemap: true,
      minify: true,
      splitting: false,
      format: "esm",
      define: { global: "window" },
      target: ["esnext"],
      platform: "browser",
      conditions: ["worker", "browser"],
    })
    .catch(() => process.exit(1));

  // cjs output bundle
  esbuild
    .build({
      entryPoints: ["src/index.ts"],
      outfile: "dist/cjs/index.cjs.js",
      bundle: true,
      sourcemap: true,
      minify: true,
      platform: "node",
      target: ["node16"],
    })
    .catch(() => process.exit(1));
};

const writeEntries = () => {
  // an entry file for cjs at the root of the bundle
  writeFileSync(join(dist, "index.js"), "export * from './esm/index.js';");

  // an entry file for esm at the root of the bundle
  writeFileSync(
    join(dist, "index.cjs.js"),
    "module.exports = require('./cjs/index.cjs.js');",
  );
};

export const build = () => {
  createDistFolder();
  buildEsmCjs();
  writeEntries();
};

build();
