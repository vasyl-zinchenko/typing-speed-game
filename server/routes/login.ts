import path from 'node:path';
import { Router, Request, Response } from 'express';

import { HTML_FILES_PATH } from '../config.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    const page = path.join(HTML_FILES_PATH, 'login.html');
    res.sendFile(page);
});

export default router;
