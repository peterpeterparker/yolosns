import esbuild from "esbuild";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const { outputFiles } = await esbuild.build({
  entryPoints: ["src/transfer.ts"],
  write: false,
  bundle: true,
  minify: true,
  splitting: false,
  treeShaking: false,
  format: "esm",
  define: { global: "window" },
  target: ["esnext"],
  platform: "browser",
  conditions: ["worker", "browser"],
});

const code = outputFiles?.[0]?.contents;
const base64 = Buffer.from(code).toString(`base64`);

writeFileSync(
  join(process.cwd(), "script.txt"),
  base64,
);
