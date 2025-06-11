import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Commerceai } from '../../../commerceai/src/lib/commerceai'; // Import the library component
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'test-app';
}
