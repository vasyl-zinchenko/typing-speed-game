import { Namespace, Socket } from 'socket.io';
import { texts } from '../data.js';
import * as config from './config.js';
import { addUser, removeUserBySocketId } from './users.js';

interface RoomUser {
    userId: string;
    username: string;
    isReady: boolean;
    progress: number;
}

interface Room {
    roomId: string;
    users: RoomUser[];
}

const rooms = new Map<string, Room>();

const getRoomsArray = (): Room[] => Array.from(rooms.values());

const getCurrentRoomId = (socket: Socket): string | undefined =>
    [...socket.rooms].find(socketRoomId => rooms.has(socketRoomId.toLowerCase()));

export default (io: Namespace): void => {
    const updateUsersInRoom = (roomId: string): void => {
        const room = rooms.get(roomId.toLowerCase());
        const usersInRoom = room?.users || [];
        io.to(roomId).emit('UPDATE_USERS_IN_ROOM', usersInRoom);
    };

    io.on('connection', (socket: Socket) => {
        const username = socket.handshake.query.username as string;

        if (username) {
            addUser(socket.id, username, 'game');
        }

        socket.emit('UPDATE_ROOMS', getRoomsArray());

        socket.on('CREATE_ROOM', (roomName: string) => {
            const trimmedName = roomName?.trim();

            if (!trimmedName) {
                socket.emit('ROOM_ERROR', { message: 'Room name cannot be empty.' });
                return;
            }

            const key = trimmedName.toLowerCase();
            if (rooms.has(key)) {
                socket.emit('ROOM_EXISTS', {
                    message: `Room "${trimmedName}" already exists. Please choose a different name.`
                });
                return;
            }

            rooms.set(key, { roomId: trimmedName, users: [] });
            io.emit('UPDATE_ROOMS', getRoomsArray());
            socket.emit('ROOM_CREATED', trimmedName);
        });

        socket.on('JOIN_ROOM', async (roomId: string) => {
            const prevRoomId = getCurrentRoomId(socket);

            if (roomId.toLowerCase() === prevRoomId?.toLowerCase()) {
                return;
            }
            if (prevRoomId) {
                socket.leave(prevRoomId);
            }

            const foundRoom = rooms.get(roomId.toLowerCase());
            if (!foundRoom) {
                return;
            }

            socket.emit('GET_ROOM_ID', foundRoom.roomId);
            io.emit('UPDATE_ROOMS', getRoomsArray());

            await socket.join(roomId);
            foundRoom.users.push({
                userId: socket.id,
                username,
                isReady: false,
                progress: 0
            });
            updateUsersInRoom(roomId);
            io.emit('UPDATE_ROOMS', getRoomsArray());

            io.to(socket.id).emit('JOIN_ROOM_DONE', { roomId, usersInRoom: foundRoom.users });
        });

        function startGameTimer(roomId: string): void {
            let timeLeft = config.SECONDS_TIMER_BEFORE_START_GAME;

            io.to(roomId).emit('TIMER_UPDATE', timeLeft);

            const timer = setInterval(() => {
                timeLeft--;

                if (timeLeft >= 0) {
                    io.to(roomId).emit('TIMER_UPDATE', timeLeft);
                } else {
                    clearInterval(timer);
                    io.to(roomId).emit('TIMER_END', texts.join(' '));
                }
            }, 1000);

            const startTimeStamp = Date.now();
            io.to(roomId).emit('TIMER_START', startTimeStamp);
        }

        socket.on(
            'IS_READY',
            ({ status, username, activeRoomId }: { status: boolean; username: string; activeRoomId: string }) => {
                const foundRoom = rooms.get(activeRoomId.toLowerCase());
                if (!foundRoom) return;

                const readyUser = foundRoom.users.find(user => user.username === username);
                if (!readyUser) return;

                readyUser.isReady = !readyUser.isReady;

                const isAllReady = foundRoom.users.every(user => user.isReady);

                if (isAllReady) {
                    io.to(activeRoomId).emit('ALL_READY', isAllReady);
                    startGameTimer(activeRoomId);
                }

                updateUsersInRoom(activeRoomId);
            }
        );

        socket.on(
            'CHANGE_PROGRESS',
            ({ username, activeRoomId, progress }: { username: string; activeRoomId: string; progress: number }) => {
                const foundRoom = rooms.get(activeRoomId.toLowerCase());
                if (!foundRoom) return;

                const user = foundRoom.users.find(user => user.username === username);
                if (!user) return;

                user.progress = progress;
                updateUsersInRoom(activeRoomId);

                io.to(activeRoomId).emit('UPDATE_PROGRESS', user.progress);
            }
        );

        socket.on('IS_WINNER_DETECTED', ({ activeRoomId }: { activeRoomId: string }) => {
            const foundRoom = rooms.get(activeRoomId.toLowerCase());
            if (!foundRoom) return;

            io.to(activeRoomId).emit('GAME_OVER', foundRoom.users);
        });

        socket.on('RESET_PROGRESS', ({ activeRoomId }: { activeRoomId: string }) => {
            const foundRoom = rooms.get(activeRoomId.toLowerCase());
            if (!foundRoom) return;

            foundRoom.users.forEach(user => {
                user.progress = 0;
                user.isReady = false;
            });

            io.to(activeRoomId).emit('RESET_PROGRESS_DONE', foundRoom.users);
        });

        socket.on('disconnect', () => {
            removeUserBySocketId(socket.id);

            rooms.forEach(room => {
                room.users = room.users.filter(user => user.userId !== socket.id);
                updateUsersInRoom(room.roomId);
            });

            io.emit('UPDATE_ROOMS', getRoomsArray());
        });
    });
};
