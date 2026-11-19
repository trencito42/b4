/**
 * Minimal post-build check: workspace dist packages resolve for a consumer-shaped import.
 * Run after `pnpm build` from repo root.
 */
import { pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

await import(pathToFileURL(join(root, "packages/react/dist/index.js")).href);
await import(pathToFileURL(join(root, "packages/motion/dist/index.js")).href);
await import(pathToFileURL(join(root, "packages/tokens/dist/index.js")).href);

console.log("consumer-smoke: @b4/react, @b4/motion, @b4/tokens entry points load.");