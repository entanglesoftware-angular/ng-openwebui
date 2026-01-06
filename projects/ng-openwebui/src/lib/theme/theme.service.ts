import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NgOpenwebUIThemeService {
    private isBrowser: boolean;
    private themeCookieKey = 'ca-theme';

    private themeSubject = new BehaviorSubject<'light-theme' | 'dark-theme'>('light-theme');
    theme$ = this.themeSubject.asObservable();

    private lightTheme = `
        :root {
            --bg-primary: #ffffff;
            --bg-sidebar: #F9F9F9;
            --header-text-color: rgb(13, 13, 13);
            --chat-bg-color: #ffffff;
            --chat-shadow: 0px 4px 4px 0px #0000000a, 0px 0px 1px 0px #0000009e;
            --chat-border-color: black;
            --chat-input-bg: #ffffff;
            --chat-input-placeholder: #8F8F8F;
            --user-msg-bg: #e9e9e980;
            --user-msg-color: rgb(13, 13, 13);
            --user-box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12);
            --assistant-msg-bg: white;
            --assistant-msg-color: #1c244e;
            --file-bg-color: #f0f0f0;
            --file-icon-color: #007bff;
            --typing-indicator-color: gray;
            --chat-input-color: #8F8F8F;
            --scrollbar-color: rgb(185, 185, 185);
            --model-card-bg:rgb(233, 233, 233);
            --text-color: rgb(13, 13, 13);
            --setting-bg: #d6d6d6;
            --sidebar-item-hover: #bebebe;

            --chat-list-text-color: #201a1b;
            --chats-label-color :rgb(143, 143, 143);
            --chats-label-hover-bg: #0000000a;
            --chats-label-selected-bg: #0000000f;
            --chats-list-button-color: #514346;
            --sidebar-border-color: #cccccc;
            --new-chat-color: rgb(0, 0, 0);
            --new-chat-hover-bg: #eeeeee;
            --dropdown-menu-bg: #ffffff;
            --setting-menu-bg: #ffffff;
            --menu-item-color: red;
            --menu-item-hover-bg: transparent;

            --snackbar-bg: #ffffff;
            --snackbar-text: #333333;
            --snackbar-action: #1976d2;

            --sidebar-bg: #ffffff;
            --sidebar-section-bg: #f6f7f9;
            --sidebar-item-bg: transparent;
            --sidebar-item-hover-bg: #f0f1f3;
            --sidebar-item-active-bg: #ebecef;

            --vino-accent: #7a1e3a; /* wine */
            --vino-accent-soft: rgba(122, 30, 58, 0.12);

            --chat-bg: #ffffff;
            --chat-column-bg: transparent;

            --bubble-user-bg: #f1f1f1;
            --bubble-user-text: #111;

            --bubble-ai-bg: #ffffff;
            --bubble-ai-text: #1c244e;

            --bubble-radius: 18px;
            --bubble-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);

            --input-bg: #ffffff;
            --input-border: #dddddd;
        }`;

    private darkTheme = `
        body.dark-theme {
            --bg-primary: #212121;
            --bg-sidebar: #181818;
            --header-text-color: rgb(255, 255, 255);
            --chat-bg-color: #bebebe;
            --chat-shadow: none;
            --chat-border-color: black;
            --chat-input-bg: #303030;
            --chat-input-placeholder: #AFAFAF;
            --user-msg-bg: #323232;
            --user-msg-color: rgb(255, 255, 255);
            --user-box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12);
            --assistant-msg-bg: #181818;
            --assistant-msg-color: #ffffff;
            --file-bg-color: #f0f0f0;
            --file-icon-color: #007bff;
            --typing-indicator-color: gray;
            --chat-input-color: #AFAFAF;
            --scrollbar-color: rgb(130, 130, 130);
            --model-card-bg: #323232;
            --text-color: rgb(255, 255, 255);
            --setting-bg: #292929;
            --sidebar-item-hover: #525050;

            --chat-list-text-color: #ffffff;
            --chats-label-color:rgb(175, 175, 175);
            --chats-label-hover-bg: #ffffff1a;
            --chats-label-selected-bg: #ffffff0d;
            --chats-list-button-color: #ffffff;
            --sidebar-border-color: #181818;
            --new-chat-color: rgb(255, 255, 255);
            --new-chat-hover-bg: #ffffff1a;
            --dropdown-menu-bg: #303030;
            --setting-menu-bg: rgb(65, 65, 65);
            --menu-item-color: red;
            --menu-item-hover-bg: transparent;

            --snackbar-bg: #323232;
            --snackbar-text: #ffffff;
            --snackbar-action: #90caf9;

            --sidebar-bg: #181818;
            --sidebar-section-bg: #202020;
            --sidebar-item-bg: transparent;
            --sidebar-item-hover-bg: #2a2a2a;
            --sidebar-item-active-bg: #303030;

            --vino-accent: #d16b8a;
            --vino-accent-soft: rgba(209, 107, 138, 0.18);

            --chat-bg: #1e1e1e;
            --chat-column-bg: transparent;

            --bubble-user-bg: #2a2a2a;
            --bubble-user-text: #ffffff;

            --bubble-ai-bg: #242424;
            --bubble-ai-text: #ffffff;

            --bubble-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);

            --input-bg: #2a2a2a;
            --input-border: #3a3a3a;
        }`;

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        @Inject(DOCUMENT) private document: Document
    ) {
        this.isBrowser = isPlatformBrowser(this.platformId);

        if (this.isBrowser) {
            this.injectStyle(this.lightTheme + this.darkTheme);
            this.loadSavedTheme();
        }
    }

    private injectStyle(css: string) {
        if (!this.isBrowser) return;
        const style = this.document.createElement('style');
        style.textContent = css;
        this.document.head.appendChild(style);
    }

    setTheme(theme: 'light-theme' | 'dark-theme') {
        if (!this.isBrowser) return;
        const body = this.document.body;
        body.classList.remove('light-theme', 'dark-theme');
        body.classList.add(theme);

        this.document.cookie = `${this.themeCookieKey}=${theme}; path=/; max-age=31536000`;

        // ✅ Emit new theme to subscribers
        this.themeSubject.next(theme);
    }

    private getCookie(name: string): string | null {
        if (!this.isBrowser) return null;
        const match = this.document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    }

    loadSavedTheme() {
        const saved = this.getCookie(this.themeCookieKey) as 'light-theme' | 'dark-theme';
        if (saved) {
            this.setTheme(saved);
        } else {
            this.setTheme('light-theme');
        }
    }

    getCurrentTheme(): 'light-theme' | 'dark-theme' | null {
        return this.themeSubject.value;
    }
}
