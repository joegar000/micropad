import type { IButtonIconModel } from "micropad-widgets";

export function svgIcon(svg: string, alt: string): IButtonIconModel {
    return {
        type: 'image',
        src: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
        alt
    };
}

export function initialIcon(initial: string, background: string, foreground = '#ffffff'): IButtonIconModel {
    return svgIcon(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${background}"/><text x="32" y="40" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="${foreground}">${initial.slice(0, 2).toUpperCase()}</text></svg>`,
        `${initial} icon`
    );
}

export const mediaIcons = {
    playPause: svgIcon(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0f766e"/><path d="M20 18v28l20-14L20 18Z" fill="#fff"/><path d="M43 18h5v28h-5V18Zm9 0h5v28h-5V18Z" fill="#fff"/></svg>',
        'Play pause'
    ),
    previous: svgIcon(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#4338ca"/><path d="M18 18h6v28h-6V18Zm8 14 22-15v30L26 32Z" fill="#fff"/></svg>',
        'Previous track'
    ),
    next: svgIcon(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#4338ca"/><path d="M40 18h6v28h-6V18ZM16 17l22 15-22 15V17Z" fill="#fff"/></svg>',
        'Next track'
    )
};
