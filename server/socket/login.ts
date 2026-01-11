import { Namespace, Socket } from 'socket.io';
import { addUser, isUsernameTaken, getUserByUsername, removeUserBySocketId } from './users.js';

export default (io: Namespace): void => {
    io.on('connection', (socket: Socket) => {
        socket.on('CHECK_USERNAME', (username: string) => {
            const trimmedUsername = username?.trim();

            if (!trimmedUsername || trimmedUsername.length < 2) {
                socket.emit('USERNAME_ERROR', {
                    message: 'Username must be at least 2 characters.'
                });
                return;
            }

            if (trimmedUsername.length > 20) {
                socket.emit('USERNAME_ERROR', {
                    message: 'Username must be at most 20 characters.'
                });
                return;
            }

            if (isUsernameTaken(trimmedUsername)) {
                socket.emit('USERNAME_ERROR', {
                    message: 'This username is already taken by another player. Please choose a different one.'
                });
            } else {
                addUser(socket.id, trimmedUsername, 'login');
                socket.emit('USERNAME_VALID', { username: trimmedUsername });
            }
        });

        socket.on('CHECK_RECONNECT', (username: string) => {
            const trimmedUsername = username?.trim();

            if (!trimmedUsername) {
                socket.emit('RECONNECT_DENIED', {
                    message: 'Invalid session. Please login again.'
                });
                return;
            }

            const existingUser = getUserByUsername(trimmedUsername);

            if (existingUser && existingUser.socketId !== socket.id) {
                socket.emit('RECONNECT_DENIED', {
                    message: `User "${trimmedUsername}" is already connected from another session. You have been logged out.`
                });
            } else {
                addUser(socket.id, trimmedUsername, 'login');
                socket.emit('RECONNECT_ALLOWED', { username: trimmedUsername });
            }
        });

        socket.on('disconnect', () => {});
    });
};
