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
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  chatNames = ['Session 1', 'Session 2', 'Session 3'];
}
