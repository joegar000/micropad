import os from "os";

export const isMac = (() => {
    return os.type() === 'Darwin' ? {} : null;
})();

export const isLinux = (() => {
    return os.type() === 'Linux' ? {} : null;
})();

export const isWindows = (() => {
    return os.type() === 'Windows_NT' ? {} : null;
})();
