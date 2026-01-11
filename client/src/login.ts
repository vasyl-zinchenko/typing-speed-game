import { io } from 'socket.io-client';
import type { Socket } from './types';
import type { UsernamePayload, UsernameErrorPayload } from './types';

const storedUsername = sessionStorage.getItem('username');
const form = document.querySelector('#login-page form') as HTMLFormElement;
const input = document.getElementById('username-input') as HTMLInputElement;
const submitButton = document.getElementById('submit-button') as HTMLButtonElement;
const modal = document.getElementById('warning-modal') as HTMLElement;
const modalMessage = document.getElementById('modal-message') as HTMLElement;
const modalCloseBtn = document.getElementById('modal-close-btn') as HTMLButtonElement;

const errorContainer = document.createElement('div');
errorContainer.className = 'error-message';
form.insertBefore(errorContainer, submitButton);

const socket: Socket = io('/login');

const showModal = (message: string, onClose: (() => void) | null = null): void => {
    modalMessage.textContent = message;
    modal.classList.remove('hidden');

    const handleClose = (): void => {
        modal.classList.add('hidden');
        modalCloseBtn.removeEventListener('click', handleClose);
        if (onClose) onClose();
    };

    modalCloseBtn.addEventListener('click', handleClose);
};

const forceLogout = (): void => {
    sessionStorage.removeItem('username');
    input.value = '';
    input.focus();
    submitButton.disabled = false;
    submitButton.textContent = 'Sign-In';
};

const showError = (message: string): void => {
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    input.classList.add('input-error');
};

const hideError = (): void => {
    errorContainer.textContent = '';
    errorContainer.style.display = 'none';
    input.classList.remove('input-error');
};

if (storedUsername) {
    submitButton.disabled = true;
    submitButton.textContent = 'Checking...';
    socket.emit('CHECK_RECONNECT', storedUsername);
}

const handleSubmit = (event: Event): void => {
    event.preventDefault();
    hideError();

    const inputValue = input.value.trim();
    if (!inputValue) {
        showError('Please enter a username.');
        return;
    }

    if (inputValue.length < 2) {
        showError('Username must be at least 2 characters.');
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Checking...';

    socket.emit('CHECK_USERNAME', inputValue);
};

socket.on('USERNAME_VALID', ({ username }: UsernamePayload) => {
    sessionStorage.setItem('username', username);
    window.location.replace('/rooms.html');
});

socket.on('USERNAME_ERROR', ({ message }: UsernameErrorPayload) => {
    showModal(message);
    submitButton.disabled = false;
    submitButton.textContent = 'Sign-In';
});

socket.on('RECONNECT_ALLOWED', ({ username }: UsernamePayload) => {
    sessionStorage.setItem('username', username);
    window.location.replace('/rooms.html');
});

socket.on('RECONNECT_DENIED', ({ message }: UsernameErrorPayload) => {
    showModal(message, forceLogout);
});

socket.on('connect_error', () => {
    showError('Unable to connect to server. Please try again.');
    submitButton.disabled = false;
    submitButton.textContent = 'Sign-In';
});

input.addEventListener('input', hideError);
form.addEventListener('submit', handleSubmit);
