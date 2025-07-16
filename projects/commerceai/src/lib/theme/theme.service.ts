import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CommerceAiThemeService {

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

            --chat-list-text-color: #201a1b;
            --chats-label-color :rgb(143, 143, 143);
            --chats-label-hover-bg: #0000000a;
            --chats-label-selected-bg: #0000000f;
            --chats-list-button-color: #514346;
            --sidebar-border-color: #cccccc;
            --new-chat-color: rgb(0, 0, 0);
            --new-chat-hover-bg: #eeeeee;
            --dropdown-menu-bg: #ffffff;
            --menu-item-color: red;
            --menu-item-hover-bg: transparent;
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

            --chat-list-text-color: #ffffff;
            --chats-label-color:rgb(175, 175, 175);
            --chats-label-hover-bg: #ffffff1a;
            --chats-label-selected-bg: #ffffff0d;
            --chats-list-button-color: #ffffff;
            --sidebar-border-color: #181818;
            --new-chat-color: rgb(255, 255, 255);
            --new-chat-hover-bg: #ffffff1a;
            --dropdown-menu-bg: #303030;
            --menu-item-color: red;
            --menu-item-hover-bg: transparent;
        }`;

    constructor() {
        this.injectStyle(this.lightTheme + this.darkTheme);
    }

    private injectStyle(css: string) {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    setTheme(theme: 'light-theme' | 'dark-theme') {
        const body = document.body;
        body.classList.remove('light-theme', 'dark-theme');
        body.classList.add(theme);
        localStorage.setItem('ca-theme', theme);
    }

    loadSavedTheme() {
        const saved = localStorage.getItem('ca-theme') as 'light-theme' | 'dark-theme';
        if (saved) this.setTheme(saved);
    }

    getCurrentTheme(): 'light-theme' | 'dark-theme' | null {
        const body = document.body;
        if (body.classList.contains('light-theme')) {
            return 'light-theme';
        } else if (body.classList.contains('dark-theme')) {
            return 'dark-theme';
        } else {
            return 'light-theme';
        }
    }
}
