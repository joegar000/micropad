import os from "os";

export const isMac = os.type() === 'Darwin';

export const isLinux = os.type() === 'Linux' ;

export const isWindows = os.type() === 'Windows_NT';
