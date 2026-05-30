import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type MediaAction = 'playPause' | 'next' | 'previous';
export type PlaybackState = 'playing' | 'paused' | 'stopped' | 'unknown';

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
