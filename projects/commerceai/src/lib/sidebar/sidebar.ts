import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {MarkdownModule} from 'ngx-markdown';
import { MaterialModule } from '../modules/material.module';

@Component({
  selector: 'lib-sidebar',
  imports: [
    MaterialModule,
    FormsModule,
    HttpClientModule,
    NgClass,
    NgForOf,
    MarkdownModule,
    NgIf,
  ],
  template: `
    <mat-toolbar color="primary">
      <span class="toolbar-title">Chats</span>
      <span class="spacer"></span>
      <button mat-icon-button (click)="addNewChat()" aria-label="New Chat">
        <mat-icon>add</mat-icon>
      </button>
    </mat-toolbar>
    <mat-nav-list>
      <mat-list-item *ngFor="let chat of chatNames">
        <div matLine>{{chat}}</div>
      </mat-list-item>
    </mat-nav-list>
  `,
  styles: `
    mat-toolbar {
      display: flex;
      align-items: center;
    }

    .toolbar-title {
      margin-left: 8px;
      font-weight: 600;
    }

    :host {
      width: 260px;
      height: 100vh;
      display: block;
      border-right: 1px solid #ccc;
      background: #fafafa;
    }

    mat-nav-list {
      padding: 0;
    }

    mat-list-item {
      cursor: pointer;
    }

    mat-list-item:hover {
      background: #eee;
    }

    .spacer {
      flex: 1 1 auto;
    }
  `
})
export class Sidebar {
  chatCounter = 1;
  chatNames: string[] = [];
  addNewChat() {
    this.chatNames.unshift(`Session ${this.chatCounter++}`);
  }
}
