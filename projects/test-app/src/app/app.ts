import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgOpenwebUI } from '../../../ng-openwebui/src/lib/ng-openwebui'; // Import the library component
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgOpenwebUI],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'test-app';
}
