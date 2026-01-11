import { Express } from 'express';

import loginRoutes from './login.js';
import roomsRoutes from './rooms.js';
import gameRoutes from './game.js';

export default (app: Express) => {
    app.use('/login', loginRoutes);
    app.use('/rooms', roomsRoutes);
    app.use('/game', gameRoutes);
};
