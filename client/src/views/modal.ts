import { createElement } from '../helpers/dom-helper';
import type { InputModalOptions, ResultsModalOptions, MessageModalOptions, WarningModalOptions } from '../types';

export const showInputModal = ({ title, onChange = () => {}, onSubmit = () => {} }: InputModalOptions): void => {
    const rootElement = document.querySelector('#root') as HTMLElement;

    const modalElement = createModalElement(title);

    const submitButton = createElement({
        tagName: 'button',
        className: 'submit-btn',
        innerElements: ['Submit']
    });

    const inputElement = createElement({
        tagName: 'input',
        className: 'modal-input'
    }) as HTMLInputElement;

    modalElement.append(getFooter([inputElement, submitButton]));
    rootElement.append(modalElement);

    submitButton.addEventListener('click', () => {
        modalElement.remove();
        onSubmit();
    });

    inputElement.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLInputElement;
        onChange(target.value);
    });
};

export const showResultsModal = ({ usersSortedArray, onClose = () => {} }: ResultsModalOptions): void => {
    const rootElement = document.querySelector('#root') as HTMLElement;

    const modalElement = createModalElement('Results: ');

    const resultElements = usersSortedArray.map((username, index) => {
        const place = index + 1;

        return createElement({
            tagName: 'div',
            className: 'user-result',
            attributes: { 'data-username': username, 'data-place': place },
            innerElements: [`${place}) ${username}`]
        });
    });

    const bodyWrapper = createElement({
        tagName: 'div',
        className: 'body-wrapper',
        innerElements: resultElements
    });

    const closeButton = createElement({
        tagName: 'button',
        className: 'submit-btn',
        attributes: { id: 'quit-results-btn' },
        innerElements: ['Close']
    });

    modalElement.append(bodyWrapper);
    modalElement.append(getFooter([closeButton]));
    rootElement.append(modalElement);

    closeButton.addEventListener('click', () => {
        modalElement.remove();
        onClose();
    });
};

export const showMessageModal = ({ message, onClose = () => {} }: MessageModalOptions): void => {
    const rootElement = document.querySelector('#root') as HTMLElement;
    const modalWrapper = document.querySelector('.modal-wrapper') as HTMLElement;
    modalWrapper.style.display = 'block';

    const modalElement = createModalElement(message);

    const closeButton = createElement({
        tagName: 'button',
        className: 'submit-btn',
        innerElements: ['Close']
    });

    modalElement.append(getFooter([closeButton]));
    rootElement.append(modalElement);

    closeButton.addEventListener('click', () => {
        modalElement.remove();
        modalWrapper.style.display = 'none';
        onClose();
    });
};

export const showWarningModal = ({ title = 'Warning', message, onClose = () => {} }: WarningModalOptions): void => {
    const rootElement = document.querySelector('#root') as HTMLElement;
    const modalWrapper = document.querySelector('.modal-wrapper') as HTMLElement;
    modalWrapper.style.display = 'block';

    const iconElement = createElement({
        tagName: 'div',
        className: 'warning-icon',
        innerElements: ['⚠️']
    });

    const titleElement = createElement({
        tagName: 'h3',
        className: 'title warning-title',
        innerElements: [title]
    });

    const messageElement = createElement({
        tagName: 'p',
        className: 'warning-message',
        innerElements: [message]
    });

    const closeButton = createElement({
        tagName: 'button',
        className: 'submit-btn warning-btn',
        innerElements: ['OK']
    });

    const modal = createElement({
        tagName: 'div',
        className: 'modal warning-modal',
        innerElements: [iconElement, titleElement, messageElement, getFooter([closeButton])]
    });

    rootElement.append(modal);

    closeButton.addEventListener('click', () => {
        modal.remove();
        modalWrapper.style.display = 'none';
        onClose();
    });
};

const createModalElement = (title: string): HTMLDivElement => {
    const titleElement = createElement({
        tagName: 'h3',
        className: 'title',
        innerElements: [title]
    });

    const modal = createElement({
        tagName: 'div',
        className: 'modal',
        innerElements: [titleElement]
    });

    return modal;
};

const getFooter = (children: HTMLElement[]): HTMLDivElement => {
    return createElement({
        tagName: 'div',
        className: 'inputs-wrapper',
        innerElements: children
    });
};
