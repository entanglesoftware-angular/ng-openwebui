import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class NgOpenwebUIThemeService {
    private isBrowser: boolean;
    private themeCookieKey = 'ca-theme';

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
        if (this.isBrowser) {
            this.document.cookie = `${this.themeCookieKey}=${theme}; path=/; max-age=31536000`;
        }
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
            this.setTheme('light-theme'); // default
        }
    }

    getCurrentTheme(): 'light-theme' | 'dark-theme' | null {
        if (!this.isBrowser) return null;
        const body = this.document.body;
        if (body.classList.contains('light-theme')) return 'light-theme';
        if (body.classList.contains('dark-theme')) return 'dark-theme';
        return 'light-theme';
    }
}
