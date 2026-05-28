import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import dns from 'dns';

const execFileAsync = promisify(execFile);

export type LocalNetworkIdentity = {
    localIp: string;
    mdnsHost: string;
    systemHost: string;
};

export function getLocalIP(): string {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name] || []) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    throw Error('Failed to find local ip');
}

export function toMdnsHostname(hostname: string): string {
    const normalized = hostname
        .trim()
        .replace(/\.$/, '')
        .replace(/\.local$/i, '');

    const firstLabel = normalized.includes('.')
        ? normalized.split('.')[0]
        : normalized;

    const sanitized = firstLabel
        .replace(/[^a-zA-Z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    return `${sanitized || 'micropad'}.local`;
}

async function getMacLocalHostname() {
    if (process.platform !== 'darwin') {
        return undefined;
    }

    try {
        const result = await execFileAsync('scutil', ['--get', 'LocalHostName']);
        const localHostname = result.stdout.trim();
        return localHostname || undefined;
    } catch {
        return undefined;
    }
}

export async function getLocalNetworkIdentity(): Promise<LocalNetworkIdentity> {
    const systemHost = os.hostname().replace(/\.$/, '');
    const macLocalHostname = await getMacLocalHostname();
    return {
        localIp: getLocalIP(),
        mdnsHost: toMdnsHostname(macLocalHostname ?? systemHost),
        systemHost
    };
}

/**
 * Verifies if the system's .local hostname is actually resolvable.
 */
export function checkMdnsSupport(hostname: string) {
    return new Promise((resolve) => {
        dns.lookup(hostname, (err) => {
            if (err) {
                console.log(`⚠️ mDNS (${hostname}) not resolvable.`);
                resolve(false);
            } else {
                console.log(`✅ mDNS (${hostname}) is active!`);
                resolve(true);
            }
        });
    });
}

export async function getAddress() {
    const identity = await getLocalNetworkIdentity();
    console.log('finding address for', identity.systemHost, '...')
    const candidates = [identity.mdnsHost, identity.systemHost];

    for (const candidate of candidates) {
        const isResolvable = await checkMdnsSupport(candidate);
        if (isResolvable) {
            return candidate;
        }
    }

    return identity.localIp;
}
