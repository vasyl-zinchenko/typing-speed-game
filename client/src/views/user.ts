import { addClass, createElement } from '../helpers/dom-helper';
import type { UserElementOptions, ChangeReadyStatusOptions, SetProgressOptions } from '../types';

export const appendUserElement = ({ username, ready, isCurrentUser }: UserElementOptions): HTMLDivElement => {
    const usersContainer = document.querySelector('#users-wrapper') as HTMLElement;

    const avatarElement = createElement({
        tagName: 'div',
        className: 'user-avatar',
        attributes: { 'data-username': username },
        innerElements: [username.charAt(0).toUpperCase()]
    });

    const usernameElement = createElement({
        tagName: 'div',
        className: 'username',
        attributes: { 'data-username': username },
        innerElements: [isCurrentUser ? `${username} (you)` : username]
    });

    const readyStatusElement = createElement({
        tagName: 'div',
        className: 'ready-status',
        attributes: { 'data-username': username, 'data-ready': Boolean(ready) },
        innerElements: [getReadySign(ready)]
    });

    const headerWrapper = createElement({
        tagName: 'div',
        className: 'user-header',
        attributes: { 'data-username': username },
        innerElements: [avatarElement, usernameElement, readyStatusElement]
    });

    const progressElement = createElement({
        tagName: 'div',
        className: 'user-progress',
        attributes: { 'data-username': username, style: `width: 0%;` }
    });

    const progressElementBlock = createElement({
        tagName: 'div',
        className: 'user-progress-template',
        innerElements: [progressElement]
    });

    const userElement = createElement({
        tagName: 'div',
        className: 'user',
        attributes: { 'data-username': username },
        innerElements: [headerWrapper, progressElementBlock]
    });

    usersContainer.append(userElement);

    return userElement;
};

export const changeReadyStatus = ({ username, ready }: ChangeReadyStatusOptions): void => {
    const readyStatusElement = document.querySelector(`.ready-status[data-username='${username}']`) as HTMLElement;
    readyStatusElement.innerHTML = getReadySign(ready);
    readyStatusElement.dataset.ready = String(Boolean(ready));
};

export const setProgress = ({ username, progress }: SetProgressOptions): void => {
    const progressElement = document.querySelector(`.user-progress[data-username='${username}']`) as HTMLElement;

    if (progress === 100) {
        progressElement.style.width = `${progress}%`;
        addClass(progressElement, 'finished');
    } else {
        progressElement.style.width = `${progress}%`;
    }
};

export const removeUserElement = (username: string): void => {
    document.querySelector(`.user[data-username='${username}']`)?.remove();
};

const getReadySign = (ready: boolean): string => (ready ? '🟢' : '🔴');
