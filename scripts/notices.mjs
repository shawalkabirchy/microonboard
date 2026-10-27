import { readFile, readdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const lock = JSON.parse(await readFile("package-lock.json", "utf8"));
const notices = [
  "MicroOnboard third-party notices\n\nProject source: MIT, copyright 2026 Shawal Kabir Chy / ConsoleLog Studio.\n\nThe UI components are adapted from shadcn/ui, MIT, copyright 2023 shadcn.\n" +
    (await readFile("LICENSE", "utf8")),
];
for (const [directory, entry] of Object.entries(lock.packages)) {
  if (!directory || entry.dev) continue;
  let packageInfo;
  let files;
  try {
    packageInfo = JSON.parse(
      await readFile(`${directory}/package.json`, "utf8"),
    );
    files = await readdir(directory);
  } catch {
    continue;
  } // Optional packages for other operating systems are not installed here.
  const licenceFiles = files.filter((name) =>
    /^(licen[cs]e|notice|copyright)(\..*)?$/i.test(name),
  );
  const texts = await Promise.all(
    licenceFiles.map((name) => readFile(`${directory}/${name}`, "utf8")),
  );
  notices.push(
    `\n${"=".repeat(72)}\n${packageInfo.name}@${packageInfo.version}\nLicence: ${packageInfo.license || "See package source"}\n${texts.join("\n")}`,
  );
}
const content = notices.join("\n");
for (const name of [
  "zod@",
  "@floating-ui/dom@",
  "react@",
  "next@",
  "idb@",
  "radix-ui@",
])
  assert(content.includes(name), `Missing notice for ${name}`);
await writeFile("public/third-party-notices.txt", content);
process.stdout.write(
  "Third-party notices generated from installed production dependencies.\n",
);
