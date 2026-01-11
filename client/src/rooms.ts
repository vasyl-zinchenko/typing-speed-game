import { io } from 'socket.io-client';
import type { Socket } from './types';
import { showInputModal, showWarningModal } from './views/modal';
import { appendRoomElement } from './views/room';
import type { Room, RoomExistsPayload, RoomErrorPayload } from './types';

const username = sessionStorage.getItem('username');

if (!username) {
    window.location.replace('/login.html');
}

const gameSocket: Socket = io('/game', { query: { username: username || '' } });

const userElement = document.getElementById('name') as HTMLElement;
const roomsContainer = document.getElementById('rooms-wrapper') as HTMLElement;
const addRoomButton = document.getElementById('add-room-btn') as HTMLButtonElement;
const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement | null;

const roomsPage = document.getElementById('rooms-page') as HTMLElement;
roomsPage.style.display = '';

userElement.innerHTML = `Hello, <strong>${username}</strong> 👋`;

logoutBtn?.addEventListener('click', () => {
    sessionStorage.removeItem('username');
    window.location.replace('/login.html');
});

addRoomButton.addEventListener('click', () => {
    let roomTitle = '';

    showInputModal({
        title: 'Input a room name',
        onChange: (value: string) => {
            roomTitle = value;
        },
        onSubmit() {
            if (!roomTitle.trim()) {
                showWarningModal({
                    title: 'Warning',
                    message: 'Room name cannot be empty.'
                });
                return;
            }
            gameSocket.emit('CREATE_ROOM', roomTitle);
        }
    });
});

const updateRooms = (rooms: Room[]): void => {
    const roomElements = rooms.map(room => {
        const onJoinRoom = (): void => {
            sessionStorage.setItem('roomId', room.roomId);
            window.location.href = `/game.html?room=${encodeURIComponent(room.roomId)}`;
        };

        return appendRoomElement({
            name: room.roomId,
            numberOfUsers: room.users.length,
            onJoin: onJoinRoom
        });
    });

    roomsContainer.innerHTML = '';
    roomsContainer.append(...roomElements);
};

gameSocket.on('UPDATE_ROOMS', updateRooms);

gameSocket.on('ROOM_CREATED', (roomName: string) => {
    sessionStorage.setItem('roomId', roomName);
    window.location.href = `/game.html?room=${encodeURIComponent(roomName)}`;
});

gameSocket.on('ROOM_EXISTS', ({ message }: RoomExistsPayload) => {
    showWarningModal({
        title: 'Room Already Exists',
        message
    });
});

gameSocket.on('ROOM_ERROR', ({ message }: RoomErrorPayload) => {
    showWarningModal({
        title: 'Error',
        message
    });
});
