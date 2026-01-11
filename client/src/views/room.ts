import { createElement } from '../helpers/dom-helper';
import type { RoomElementOptions, UpdateRoomOptions } from '../types';

export const appendRoomElement = ({ name, numberOfUsers, onJoin = () => {} }: RoomElementOptions): HTMLDivElement => {
    const roomsContainer = document.querySelector('#rooms-wrapper') as HTMLElement;

    const nameElement = createElement({
        tagName: 'div',
        className: 'room-name',
        attributes: { 'data-room-name': name },
        innerElements: [name]
    });

    const numberOfUsersString = getNumberOfUsersString(numberOfUsers);
    const connectedUsersElement = createElement({
        tagName: 'div',
        className: 'connected-users',
        attributes: { 'data-room-name': name, 'data-room-number-of-users': numberOfUsers },
        innerElements: [numberOfUsersString]
    });

    const joinButton = createElement({
        tagName: 'button',
        className: 'join-btn',
        attributes: { 'data-room-name': name },
        innerElements: ['Join']
    });

    const roomElement = createElement({
        tagName: 'div',
        className: 'room',
        attributes: { 'data-room-name': name },
        innerElements: [nameElement, connectedUsersElement, joinButton]
    });

    roomsContainer.append(roomElement);

    joinButton.addEventListener('click', onJoin);

    return roomElement;
};

export const updateNumberOfUsersInRoom = ({ name, numberOfUsers }: UpdateRoomOptions): void => {
    const roomConnectedUsersElement = document.querySelector(
        `.connected-users[data-room-name='${name}']`
    ) as HTMLElement;
    roomConnectedUsersElement.innerText = getNumberOfUsersString(numberOfUsers);
    roomConnectedUsersElement.dataset.roomNumberOfUsers = String(numberOfUsers);
};

const getNumberOfUsersString = (numberOfUsers: number): string => `${numberOfUsers} connected`;

export const removeRoomElement = (name: string): void => {
    document.querySelector(`.room[data-room-name='${name}']`)?.remove();
};
