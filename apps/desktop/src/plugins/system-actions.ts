import { execFile, spawn } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

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

export async function runMediaAction(action: MediaAction): Promise<void> {
    if (process.platform === 'darwin') {
        await runDarwinMediaAction(action);
        return;
    }

    if (process.platform === 'win32') {
        await runWindowsMediaAction(action);
        return;
    }

    await runLinuxMediaAction(action);
}

export async function getMediaPlaybackState(): Promise<PlaybackState> {
    if (process.platform === 'darwin') {
        return getDarwinMediaPlaybackState();
    }

    if (process.platform === 'linux') {
        try {
            const { stdout } = await execFileAsync('playerctl', ['status']);
            return normalizePlaybackState(stdout);
        } catch {
            return 'unknown';
        }
    }

    return 'unknown';
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

async function runDarwinMediaAction(action: MediaAction): Promise<void> {
    const commands: Record<MediaAction, { spotify: string, music: string }> = {
        playPause: { spotify: 'playpause', music: 'playpause' },
        next: { spotify: 'next track', music: 'next track' },
        previous: { spotify: 'previous track', music: 'previous track' }
    };
    const command = commands[action];

    await execFileAsync('osascript', ['-e', `
tell application "System Events"
  set spotifyIsRunning to exists application process "Spotify"
  set musicIsRunning to exists application process "Music"
end tell

if spotifyIsRunning then
  tell application "Spotify" to ${command.spotify}
else if musicIsRunning then
  tell application "Music" to ${command.music}
end if
`]);
}

async function getDarwinMediaPlaybackState(): Promise<PlaybackState> {
    const { stdout } = await execFileAsync('osascript', ['-e', `
tell application "System Events"
  set spotifyIsRunning to exists application process "Spotify"
  set musicIsRunning to exists application process "Music"
end tell

if spotifyIsRunning then
  tell application "Spotify" to return player state as string
else if musicIsRunning then
  tell application "Music" to return player state as string
else
  return "unknown"
end if
`]);

    return normalizePlaybackState(stdout);
}

async function runWindowsMediaAction(action: MediaAction): Promise<void> {
    const virtualKeys: Record<MediaAction, string> = {
        playPause: '0xB3',
        next: '0xB0',
        previous: '0xB1'
    };

    await execFileAsync('powershell', [
        '-NoProfile',
        '-Command',
        `
$signature = '[DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);';
Add-Type -MemberDefinition $signature -Name Keyboard -Namespace Win32;
$key = [byte]${virtualKeys[action]};
[Win32.Keyboard]::keybd_event($key, 0, 0, [UIntPtr]::Zero);
[Win32.Keyboard]::keybd_event($key, 0, 2, [UIntPtr]::Zero);
`
    ]);
}

async function runLinuxMediaAction(action: MediaAction): Promise<void> {
    const commands: Record<MediaAction, string> = {
        playPause: 'play-pause',
        next: 'next',
        previous: 'previous'
    };

    await execFileAsync('playerctl', [commands[action]]);
}

function normalizePlaybackState(value: string): PlaybackState {
    const state = value.trim().toLowerCase();
    if (state.includes('playing')) return 'playing';
    if (state.includes('paused')) return 'paused';
    if (state.includes('stopped')) return 'stopped';
    return 'unknown';
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
