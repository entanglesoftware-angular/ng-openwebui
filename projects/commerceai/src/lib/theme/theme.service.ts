import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CommerceAiThemeService {

     private lightTheme = `
        :root {
            --chat-bg-color: #ffffff;
            --chat-shadow: 0px 4px 4px 0px #0000000a, 0px 0px 1px 0px #0000009e;
            --chat-border-color: black;
            --chat-input-bg: #ffffff;
            --user-msg-bg: #e9e9e980;
            --user-msg-color: rgb(13, 13, 13);
            --user-box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12);
            --assistant-msg-bg: white;
            --assistant-msg-color: #1c244e;
            --file-bg-color: #f0f0f0;
            --file-icon-color: #007bff;
            --typing-indicator-color: gray;
        }`;

    private darkTheme = `
        body.dark-theme {
            --chat-bg-color: #bebebe;
            --chat-shadow: 0px 4px 4px 0px #de0e0e0a, 0px 0px 1px 0px #0000009e;
            --chat-border-color: black;
            --chat-input-bg: #ffffff;
            --user-msg-bg: rgba(223, 0, 0, 0.5);
            --user-msg-color: rgb(13, 13, 13);
            --user-box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12);
            --assistant-msg-bg: white;
            --assistant-msg-color: #1c244e;
            --file-bg-color: #f0f0f0;
            --file-icon-color: #007bff;
            --typing-indicator-color: gray;
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
}
