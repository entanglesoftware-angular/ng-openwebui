import { Component } from '@angular/core';
import { CommerceAiThemeService } from '../theme/theme.service';

@Component({
  selector: 'lib-theme-switcher',
  standalone: true,
  templateUrl: './theme-switcher.html',
  styleUrls: ['./theme-switcher.css'],
})
export class ThemeSwitcherComponent {
  constructor(public themeService: CommerceAiThemeService) {}

  changeTheme(theme: string) {
    this.themeService.setTheme(theme as 'light-theme' | 'dark-theme');
  }
}
