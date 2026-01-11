import type { Socket } from 'socket.io-client';

export interface CreateElementOptions {
    tagName: keyof HTMLElementTagNameMap;
    className?: string;
    attributes?: Record<string, string | number | boolean>;
    innerElements?: (string | HTMLElement)[];
}

export interface InputModalOptions {
    title: string;
    onChange?: (value: string) => void;
    onSubmit?: () => void;
}

export interface ResultsModalOptions {
    usersSortedArray: string[];
    onClose?: () => void;
}

export interface MessageModalOptions {
    message: string;
    onClose?: () => void;
}

export interface WarningModalOptions {
    title?: string;
    message: string;
    onClose?: () => void;
}

export interface RoomElementOptions {
    name: string;
    numberOfUsers: number;
    onJoin?: () => void;
}

export interface UpdateRoomOptions {
    name: string;
    numberOfUsers: number;
}

export interface UserElementOptions {
    username: string;
    ready: boolean;
    isCurrentUser: boolean;
}

export interface ChangeReadyStatusOptions {
    username: string;
    ready: boolean;
}

export interface SetProgressOptions {
    username: string;
    progress: number;
}

export interface GameUser {
    username: string;
    userId: string;
    isReady: boolean;
    progress: number;
}

export interface Room {
    roomId: string;
    users: GameUser[];
}

export interface JoinRoomDonePayload {
    roomId: string;
    usersInRoom: GameUser[];
}

export interface UsernamePayload {
    username: string;
}

export interface UsernameErrorPayload {
    message: string;
}

export interface RoomExistsPayload {
    message: string;
}

export interface RoomErrorPayload {
    message: string;
}

export type { Socket };

declare global {
    function io(namespace: string, options?: { query?: Record<string, string> }): Socket;
}
