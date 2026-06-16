import { spawn } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export type MediaAction = 'playPause' | 'next' | 'previous';
export type PlaybackState = 'playing' | 'paused' | 'stopped' | 'unknown';
export type InstalledApp = {
    id: string;
    title: string;
    target: string;
};

export function launchApp(target: string): void {
    if (process.platform === 'darwin') {
        const args = target.endsWith('.app') || target.startsWith('/')
            ? [target]
            : ['-a', target];
        const child = spawn('open', args, { detached: true, stdio: 'ignore' });
        child.unref();
        return;
    }

    if (process.platform === 'win32') {
        const child = spawn('cmd', ['/c', 'start', '', target], {
            detached: true,
            stdio: 'ignore',
            windowsHide: true
        });
        child.unref();
        return;
    }

    const child = spawn(target, [], { detached: true, stdio: 'ignore' });
    child.unref();
}

export async function listInstalledApps(): Promise<InstalledApp[]> {
    if (process.platform === 'darwin') {
        return listDarwinApps();
    }

    if (process.platform === 'win32') {
        return listWindowsApps();
    }

    return listLinuxApps();
}

async function listDarwinApps(): Promise<InstalledApp[]> {
    const roots = [
        '/Applications',
        '/System/Applications',
        path.join(os.homedir(), 'Applications')
    ];
    const apps = await Promise.all(roots.map(root => listDarwinAppsInDirectory(root)));
    return uniqueApps(apps.flat());
}

async function listDarwinAppsInDirectory(root: string): Promise<InstalledApp[]> {
    try {
        const entries = await readdir(root, { withFileTypes: true });
        const apps = entries
            .filter(entry => entry.isDirectory() && entry.name.endsWith('.app'))
            .map(entry => {
                const title = entry.name.replace(/\.app$/i, '');
                const target = path.join(root, entry.name);
                return {
                    id: normalizeAppId(title),
                    title,
                    target
                };
            });
        const nested = await Promise.all(entries
            .filter(entry => entry.isDirectory() && !entry.name.endsWith('.app'))
            .map(entry => listDarwinAppsInDirectory(path.join(root, entry.name))));

        return [...apps, ...nested.flat()];
    } catch {
        return [];
    }
}

async function listWindowsApps(): Promise<InstalledApp[]> {
    const roots = [
        path.join(process.env.ProgramData ?? 'C:\\ProgramData', 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
        path.join(os.homedir(), 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs')
    ];
    const apps = await Promise.all(roots.map(root => listShortcutAppsInDirectory(root)));
    return uniqueApps(apps.flat());
}

async function listShortcutAppsInDirectory(root: string): Promise<InstalledApp[]> {
    try {
        const entries = await readdir(root, { withFileTypes: true });
        const shortcuts = entries
            .filter(entry => entry.isFile() && entry.name.endsWith('.lnk'))
            .map(entry => {
                const title = entry.name.replace(/\.lnk$/i, '');
                return {
                    id: normalizeAppId(title),
                    title,
                    target: path.join(root, entry.name)
                };
            });
        const nested = await Promise.all(entries
            .filter(entry => entry.isDirectory())
            .map(entry => listShortcutAppsInDirectory(path.join(root, entry.name))));

        return [...shortcuts, ...nested.flat()];
    } catch {
        return [];
    }
}

async function listLinuxApps(): Promise<InstalledApp[]> {
    const roots = [
        '/usr/share/applications',
        '/usr/local/share/applications',
        path.join(os.homedir(), '.local', 'share', 'applications')
    ];
    const apps = await Promise.all(roots.map(root => listDesktopEntries(root)));
    return uniqueApps(apps.flat());
}

async function listDesktopEntries(root: string): Promise<InstalledApp[]> {
    try {
        const entries = await readdir(root, { withFileTypes: true });
        const apps = await Promise.all(entries
            .filter(entry => entry.isFile() && entry.name.endsWith('.desktop'))
            .map(async entry => {
                const target = path.join(root, entry.name);
                const content = await readFile(target, 'utf8');
                const name = content.match(/^Name=(.+)$/m)?.[1] ?? entry.name.replace(/\.desktop$/i, '');
                const exec = content.match(/^Exec=(.+)$/m)?.[1]?.split(/\s+/)[0] ?? target;
                return {
                    id: normalizeAppId(name),
                    title: name,
                    target: exec
                };
            }));

        return apps;
    } catch {
        return [];
    }
}

function normalizeAppId(value: string): string {
    return value
        .trim()
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase()
        || 'app';
}

function uniqueApps(apps: InstalledApp[]): InstalledApp[] {
    const seen = new Set<string>();
    return apps
        .filter(app => {
            const key = app.target.toLowerCase();
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        })
        .sort((a, b) => a.title.localeCompare(b.title));
}
