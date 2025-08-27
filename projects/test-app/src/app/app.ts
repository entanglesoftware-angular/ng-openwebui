import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgOpenwebui } from '../../../ng-openwebui/src/lib/ng-openwebui'; // Import the library component
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgOpenwebui],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'test-app';
}
