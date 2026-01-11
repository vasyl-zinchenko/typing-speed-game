import type { CreateElementOptions } from '../types';

export const createElement = <K extends keyof HTMLElementTagNameMap>({
    tagName,
    className,
    attributes = {},
    innerElements = []
}: CreateElementOptions & { tagName: K }): HTMLElementTagNameMap[K] => {
    const element = document.createElement(tagName);

    if (className) {
        addClass(element, className);
    }

    Object.keys(attributes).forEach(key => element.setAttribute(key, String(attributes[key])));

    innerElements.forEach(innerElement => element.append(innerElement));

    return element;
};

export const addClass = (element: HTMLElement, className: string): void => {
    const classNames = formatClassNames(className);
    element.classList.add(...classNames);
};

export const removeClass = (element: HTMLElement, className: string): void => {
    const classNames = formatClassNames(className);
    element.classList.remove(...classNames);
};

export const formatClassNames = (className: string): string[] => className.split(' ').filter(Boolean);
