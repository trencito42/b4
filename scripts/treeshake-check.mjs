import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const consumerRoot = join(root, "examples/minimal-consumer");
const consumerDist = join(consumerRoot, "dist/assets");
const viteBin = join(root, "node_modules", ".bin", process.platform === "win32" ? "vite.cmd" : "vite");

const build = spawnSync(viteBin, ["build"], { cwd: consumerRoot, stdio: "inherit", shell: process.platform === "win32" });
if (build.status !== 0) {
  throw new Error("treeshake-check: minimal consumer build failed.");
}

const jsFiles = readdirSync(consumerDist).filter((name) => name.endsWith(".js"));
const bundleText = jsFiles.map((name) => readFileSync(join(consumerDist, name), "utf8")).join("\n");

const forbidden = ["DataGrid", "FileExplorer", "CommandPalette"];
const found = forbidden.filter((name) => bundleText.includes(name));
if (found.length > 0) {
  throw new Error(`treeshake-check: consumer imported only Button but bundle contains: ${found.join(", ")}`);
}

console.log(`treeshake-check: minimal consumer bundle OK (${jsFiles.length} chunk(s), no heavy components).`);