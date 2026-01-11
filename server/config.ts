import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production';

export const STATIC_PATH = isProd ? path.join(__dirname, '..', 'dist', 'client') : path.join(__dirname, '..', 'public');

export const HTML_FILES_PATH = isProd
    ? path.join(__dirname, '..', 'dist', 'client')
    : path.join(__dirname, '..', 'client');

export const PORT = Number(process.env.PORT) || 3333;
