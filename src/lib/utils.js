import { networkInterfaces } from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

export const filename = (meta) => {
    const __filename = fileURLToPath(meta.url);
    return __filename;
};

export const dirname = (meta) => {
    const __filename = fileURLToPath(meta.url);
    return path.dirname(__filename);
};

export const getLocalIP = () => {
    const interfaces = networkInterfaces();

    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
};
