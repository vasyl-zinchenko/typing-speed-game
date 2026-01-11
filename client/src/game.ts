import { io } from 'socket.io-client';
import type { Socket } from './types';
import { showMessageModal, showResultsModal } from './views/modal';
import { addClass, removeClass } from './helpers/dom-helper';
import { appendUserElement, setProgress } from './views/user';
import type { GameUser, JoinRoomDonePayload, UsernameErrorPayload } from './types';

const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room') || sessionStorage.getItem('roomId');
const username = sessionStorage.getItem('username');

if (!username) {
    window.location.replace('/login.html');
}

if (!roomId) {
    window.location.replace('/rooms.html');
}

const gamePage = document.getElementById('game-page') as HTMLElement;
gamePage.style.display = '';

const gameSocket: Socket = io('/game', { query: { username: username || '' } });

const roomNameElement = document.getElementById('room-name') as HTMLElement;
const timer = document.getElementById('timer') as HTMLElement;
const textContainer = document.getElementById('text-container') as HTMLElement;
const gameTimer = document.getElementById('game-timer') as HTMLElement;
const readyBtn = document.getElementById('ready-btn') as HTMLButtonElement;
const quitRoomBtn = document.getElementById('quit-room-btn') as HTMLButtonElement;

let text = '';
let textLength = 0;
let correctInput = '';
let localTimerStarted = false;
let isGameOverHandled = false;

let charElements: HTMLSpanElement[] = [];
let currentCharIndex = 0;

roomNameElement.textContent = `🎮 ${roomId}`;

gameSocket.emit('JOIN_ROOM', roomId);

quitRoomBtn.addEventListener('click', () => {
    sessionStorage.removeItem('roomId');
    window.location.replace('/rooms.html');
});

readyBtn.addEventListener('click', () => {
    readyBtn.innerText = readyBtn.innerText === '🎮 READY' ? '❌ NOT READY' : '🎮 READY';
    gameSocket.emit('IS_READY', { status: readyBtn.innerText, username, activeRoomId: roomId });
});

function initializeTextElements(textString: string): void {
    textContainer.innerHTML = '';
    charElements = [];
    currentCharIndex = 0;

    textString.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char;
        span.dataset.index = String(index);
        charElements.push(span);
        textContainer.appendChild(span);
    });
}

function TimerEnd(texts: string): void {
    removeClass(textContainer, 'display-none');
    removeClass(gameTimer, 'display-none');
    text = texts;
    textLength = texts.length;
    initializeTextElements(texts);
}

const handleKeyPress = (key: string): void => {
    if (currentCharIndex >= textLength) return;

    if (key === text[currentCharIndex]) {
        charElements[currentCharIndex].classList.add('correct');
        currentCharIndex++;
        correctInput += key;

        const progress = (currentCharIndex * 100) / textLength;
        gameSocket.emit('CHANGE_PROGRESS', { username, activeRoomId: roomId, progress });
    }
};

document.addEventListener('keypress', (event: KeyboardEvent) => {
    handleKeyPress(event.key);
});

function resetGameState(): void {
    charElements = [];
    currentCharIndex = 0;
    correctInput = '';
    text = '';
    textLength = 0;
    isGameOverHandled = false;
    readyBtn.innerText = '🎮 READY';
    addClass(readyBtn, 'display-none');
}

function startTimer(startTimeStamp: number): void {
    if (!localTimerStarted) {
        const currentTime = Date.now();
        const timeDifference = currentTime - startTimeStamp;
        const remainingTime = 5 * 1000 - timeDifference;
        startLocalTimer(remainingTime);
        localTimerStarted = true;
    }
}

function startLocalTimer(remainingTime: number): void {
    const startTime = Date.now();

    const updateTimer = (): void => {
        const elapsedTime = Date.now() - startTime;
        const remaining = Math.max(0, remainingTime - elapsedTime);

        if (remaining > 0) {
            setTimeout(updateTimer, 1000);
        } else {
            addClass(timer, 'display-none');
        }
    };
    updateTimer();
}

function timeLeft(time: number): void {
    timer.innerText = String(time);
}

function checkAllReady(allReady: boolean): void {
    if (allReady) {
        removeClass(timer, 'display-none');
        addClass(readyBtn, 'display-none');
    }
}

function updateUsersInRoom(usersInRoom: GameUser[]): void {
    const usersContainer = document.querySelector('#users-wrapper') as HTMLElement;
    usersContainer.innerHTML = '';

    const isWinnerDetected = usersInRoom.some(user => user.progress === 100);

    usersInRoom.forEach(user => {
        appendUserElement({
            username: user.username,
            ready: user.isReady,
            isCurrentUser: user.userId === gameSocket.id
        });
        setProgress({ username: user.username, progress: user.progress });
    });

    if (isWinnerDetected) {
        gameSocket.emit('IS_WINNER_DETECTED', { activeRoomId: roomId });
    }
}

function gameOver(users: GameUser[]): void {
    if (isGameOverHandled) return;
    isGameOverHandled = true;

    const sortedUser = [...users].sort((a, b) => b.progress - a.progress);
    const usersName = sortedUser.map(user => user.username);

    showResultsModal({
        usersSortedArray: usersName
    });

    gameSocket.emit('RESET_PROGRESS', { activeRoomId: roomId });
}

gameSocket.on('JOIN_ROOM_DONE', ({ usersInRoom }: JoinRoomDonePayload) => {
    updateUsersInRoom(usersInRoom);
});

gameSocket.on('UPDATE_USERS_IN_ROOM', updateUsersInRoom);
gameSocket.on('ALL_READY', checkAllReady);
gameSocket.on('TIMER_START', startTimer);
gameSocket.on('TIMER_UPDATE', timeLeft);
gameSocket.on('TIMER_END', TimerEnd);
gameSocket.on('GAME_OVER', gameOver);

gameSocket.on('RESET_PROGRESS_DONE', (users: GameUser[]) => {
    resetGameState();
    updateUsersInRoom(users);
    removeClass(readyBtn, 'display-none');
    localTimerStarted = false;
});

gameSocket.on('USERNAME_EXISTS', (data: UsernameErrorPayload) => {
    showMessageModal({
        message: data.message,
        onClose() {
            sessionStorage.removeItem('username');
            window.location.replace('/login.html');
        }
    });
});
