import fs from "node:fs/promises";
import path from "node:path";
import { ConvexHttpClient } from "convex/browser";

async function readEnvValue(name) {
  const envPath = path.join(process.cwd(), ".env.local");
  const text = await fs.readFile(envPath, "utf8");
  const line = text
    .split(/\r?\n/)
    .find((entry) => entry.trim().startsWith(`${name}=`));
  if (!line) return "";
  return line.slice(line.indexOf("=") + 1).trim();
}

async function main() {
  const convexUrl =
    process.env.NEXT_PUBLIC_CONVEX_URL ||
    (await readEnvValue("NEXT_PUBLIC_CONVEX_URL"));
  if (!convexUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_CONVEX_URL. Set it in env or .env.local first.",
    );
  }

  const datasetPath = path.join(
    process.cwd(),
    "stitch_motorcycle_fog_light_selection_tool",
    "fog_lights_dataset.json",
  );
  const raw = await fs.readFile(datasetPath, "utf8");
  const fogLights = JSON.parse(raw);
  if (!Array.isArray(fogLights)) {
    throw new Error("Dataset must be an array of fog lights.");
  }

  const client = new ConvexHttpClient(convexUrl);
  const result = await client.mutation("fogLights:replaceFogLights", {
    fogLights,
  });
  console.log(
    `Upload complete. Inserted: ${result.inserted}, Deleted: ${result.deleted}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
