import { readdir, readFile } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import type { Socket } from "socket.io";
import type { ServerPlugin } from "micropad-sdk/server";
import { ServerPluginContext } from "./context.ts";
import { type PluginManifestSchema, pluginManifestSchema } from "micropad-sdk/server";

export type PluginBundle = {
  server: ServerPlugin;
  client: string;
}

function resolveEntrypoint(pluginDirectory: string, entrypoint: string): string {
  const resolvedEntrypoint = resolve(pluginDirectory, entrypoint);
  const entrypointPath = relative(pluginDirectory, resolvedEntrypoint);

  if (
    isAbsolute(entrypoint)
    || entrypointPath === ".."
    || entrypointPath.startsWith(`..${sep}`)
    || isAbsolute(entrypointPath)
  ) {
    throw new Error(`Plugin entrypoint must be relative to its plugin directory: ${entrypoint}`);
  }

  return resolvedEntrypoint;
}

async function loadPlugin(pluginDirectory: string): Promise<PluginBundle | undefined> {
  try {
    const manifest = pluginManifestSchema.parse(
      JSON.parse(await readFile(resolve(pluginDirectory, "manifest.json"), "utf8"))
    );
    const pluginModule = await import(
      pathToFileURL(resolveEntrypoint(pluginDirectory, manifest.entrypoints.server)).href
    );

    if (typeof pluginModule.default !== "function") {
      throw new Error("Server entrypoint must have a default plugin class export");
    }

    const Plugin = pluginModule.default as new (...args: ConstructorParameters<typeof ServerPlugin>) => ServerPlugin;

    const clientPluginUrl = resolve(resolveEntrypoint(pluginDirectory, manifest.entrypoints.client));

    return { server: new Plugin(manifest), client: clientPluginUrl };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to load plugin at ${pluginDirectory}: ${message}`);
  }
}

async function discoverPlugins(pluginDirectory: string): Promise<PluginBundle[]> {
  let entries;
  try {
    entries = await readdir(pluginDirectory, { withFileTypes: true });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "ENOENT") {
      return [];
    }
    throw error;
  }

  const pluginBundles = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => loadPlugin(resolve(pluginDirectory, entry.name)))
  );
  const pluginLookup = new Map<string, PluginBundle>();

  for (const bundle of pluginBundles) {
    if (!bundle) {
      continue;
    }
    if (pluginLookup.has(bundle.server.manifest.id)) {
      console.error(`Skipped duplicate plugin ID: ${bundle.server.manifest.id}`);
      continue;
    }
    pluginLookup.set(bundle.server.manifest.id, bundle);
  }

  return [...pluginLookup.values()];
}

const pluginDirectory = resolve(import.meta.dirname, "../../../plugins");
export const plugins = await discoverPlugins(pluginDirectory);

console.info(`Loaded ${plugins.length} plugin(s)`);

// export function loadPlugins(socket: Socket): void {
//   for (const { manifest, Plugin } of pluginFactories) {
//     try {
//       new Plugin().init(new ServerPluginContext(socket, manifest.id));
//     } catch (error) {
//       const message = error instanceof Error ? error.message : String(error);
//       console.error(`Failed to initialize plugin ${manifest.id}: ${message}`);
//     }
//   }
// }

