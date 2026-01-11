import { Server } from 'socket.io';
import login from './login.js';
import game from './game.js';

export default (io: Server) => {
    login(io.of('/login'));
    game(io.of('/game'));
};
