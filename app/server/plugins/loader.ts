import { readdir, readFile } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import type { Socket } from "socket.io";
import type { ServerPlugin } from "micropad-sdk/server";
import { z } from "zod";
import { ServerPluginContext } from "./context.ts";

const pluginManifestSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  minAppVersion: z.string().min(1),
  description: z.string(),
  author: z.string().min(1),
  isDesktopOnly: z.boolean(),
  entrypoints: z.object({
    server: z.string().min(1),
    client: z.string().min(1),
  }),
});

type PluginManifest = z.infer<typeof pluginManifestSchema>;
type PluginFactory = {
  manifest: PluginManifest;
  Plugin: new () => ServerPlugin;
};

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

async function loadPlugin(pluginDirectory: string): Promise<PluginFactory | undefined> {
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

    const Plugin = pluginModule.default as PluginFactory["Plugin"];
    if (new Plugin().pluginName !== manifest.id) {
      throw new Error(`Plugin name does not match manifest ID "${manifest.id}"`);
    }

    return { manifest, Plugin };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to load plugin at ${pluginDirectory}: ${message}`);
  }
}

async function discoverPlugins(pluginDirectory: string): Promise<PluginFactory[]> {
  let entries;
  try {
    entries = await readdir(pluginDirectory, { withFileTypes: true });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "ENOENT") {
      return [];
    }
    throw error;
  }

  const plugins = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => loadPlugin(resolve(pluginDirectory, entry.name)))
  );
  const pluginFactories = new Map<string, PluginFactory>();

  for (const plugin of plugins) {
    if (!plugin) {
      continue;
    }
    if (pluginFactories.has(plugin.manifest.id)) {
      console.error(`Skipped duplicate plugin ID: ${plugin.manifest.id}`);
      continue;
    }
    pluginFactories.set(plugin.manifest.id, plugin);
  }

  return [...pluginFactories.values()];
}

const pluginDirectory = resolve(import.meta.dirname, "../../../plugins");
const pluginFactories = await discoverPlugins(pluginDirectory);

console.info(`Loaded ${pluginFactories.length} plugin(s)`);

export function loadPlugins(socket: Socket): void {
  for (const { manifest, Plugin } of pluginFactories) {
    try {
      new Plugin().init(new ServerPluginContext(socket, manifest.id));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Failed to initialize plugin ${manifest.id}: ${message}`);
    }
  }
}
