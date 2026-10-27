import { build } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";
import { gzipSync, brotliCompressSync } from "node:zlib";
import { z } from "zod";
import { tourSchema } from "../src/core/config.ts";
import { sampleTour } from "../src/core/sample.ts";

const directory = "public/embed/1.0.0";
await mkdir(directory, { recursive: true });
const result = await build({
  entryPoints: ["src/runtime/index.ts"],
  outfile: `${directory}/microonboard.min.js`,
  bundle: true,
  write: false,
  format: "iife",
  globalName: "MicroOnboard",
  platform: "browser",
  target: "es2022",
  minify: true,
  legalComments: "eof",
  metafile: true,
});
if (
  Object.keys(result.metafile!.inputs).some((path) =>
    /node_modules\/(react|react-dom|next|idb)\//.test(path),
  )
)
  throw new Error("An editor dependency leaked into the embed bundle.");
const output = result.outputFiles[0].contents;
await writeFile(`${directory}/microonboard.min.js`, output);
await writeFile(
  `${directory}/tour.schema.json`,
  JSON.stringify(
    {
      ...z.toJSONSchema(tourSchema),
      title: "MicroOnboard tour configuration",
      description:
        "Schema v1. Runtime additionally validates selector syntax, unique step IDs, and the UTF-8 byte limit.",
    },
    null,
    2,
  ),
);
await writeFile(
  "public/example-tour.json",
  JSON.stringify(sampleTour, null, 2),
);
await mkdir("public/examples", { recursive: true });
await writeFile(
  "public/examples/config.js",
  `window.exampleConfig = ${JSON.stringify(sampleTour)};\n`,
);
const report = {
  runtimeVersion: "1.0.0",
  bytes: output.byteLength,
  gzipBytes: gzipSync(output).byteLength,
  brotliBytes: brotliCompressSync(output).byteLength,
  dependencies: ["zod", "@floating-ui/dom"],
};
await writeFile(`${directory}/size.json`, JSON.stringify(report, null, 2));
process.stdout.write(
  `Embed: ${report.bytes} bytes minified; ${report.gzipBytes} gzip; ${report.brotliBytes} Brotli.\n`,
);
