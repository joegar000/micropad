import os from "node:os";
import dns from 'dns';

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
    console.log('finding address for', os.hostname(), '...')
    const baseHost = os.hostname().replace(/\.local$/, '');
    const mDNSHost = `${baseHost}.local`;
    const localIp = getLocalIP();

    const isMdnsValid = await checkMdnsSupport(os.hostname());
    return isMdnsValid ? mDNSHost : localIp;
}
