import {
  Component,
  ViewEncapsulation,
  Output,
  EventEmitter,
  Inject,
  PLATFORM_ID,
  HostListener,
  ViewChild,
} from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgClass, DOCUMENT, isPlatformBrowser, NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SettingsDialog } from '../settings-dialog/settings-dialog';
import { MatToolbar } from '@angular/material/toolbar';
import { MatCard } from '@angular/material/card';
import { UserService } from '../user.service';
import { NgOpenwebUIThemeService } from '../theme/theme.service';
import { FormsModule } from '@angular/forms';
import { NgOpenwebUIConfigValidator } from '../services/ng-openwebui-config-validator.service';
import { NG_OPEN_WEB_UI_CONFIG } from '../config/ng-openwebui-config.token';
import { NgOpenwebUIConfig } from '../config/ng-openwebui-config';
import { MatSidenav } from '@angular/material/sidenav';

interface LoginResponse {
  account: {
    id: string;
    name: string;
    email: string;
    phone: string;
    userType: string;
  };
  JWT_Token: string;
  Refresh_Token: string;
}

@Component({
  selector: 'lib-header',
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    NgClass,
    NgIf,
    NgFor,
    MatInputModule,
    MatIcon,
    MatMenuModule,
    MatButtonModule,
    MatToolbar,
    MatCard,
    FormsModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
  encapsulation: ViewEncapsulation.None,
})
export class Header {
  @Output() menuClicked = new EventEmitter<void>();

  onMenuClick() {
    this.menuClicked.emit();
  }

  modelMap: { model: string; domain: string }[] = [];
  selectedModel: string = '';
  selectedDomain: string = '';
  dropdownOpen: boolean = false;
  rofileDropdownOpen: boolean = false;
  userInitial: string = '';
  selectedIndex: number = 0;
  private isBrowser: boolean;
  currentTheme: string = 'light-theme';

  constructor(
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog,
    private userService: UserService,
    public themeService: NgOpenwebUIThemeService,
    private configValidator: NgOpenwebUIConfigValidator,
    @Inject(NG_OPEN_WEB_UI_CONFIG) private config: NgOpenwebUIConfig,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.config = this.configValidator.getConfig();
  }

  ngOnInit(): void {
    this.userService.user$.subscribe((user) => {
      this.userInitial = user?.initial || '';
    });

    // ✅ Ensure sessionStorage only accessed in browser
    if (this.isBrowser) {
      if (!sessionStorage.getItem('jwt')) {
        this.getToken();
      } else {
        this.fetchAccountDetails();
      }
    }

    this.fetchModels();

    // ✅ Only add event listener in browser
    if (this.isBrowser) {
      this.document.addEventListener('click', this.closeModelDropdown.bind(this));
    }

    // Load current theme
    this.themeService.theme$.subscribe(theme => {
        this.currentTheme = theme;
    });
  }

  fetchModels() {
    const domain = this.config.domain;
    this.http.get<any>(`${domain}/v1/models`).subscribe({
      next: (res) => {
        const models = res?.data?.map((m: any) => m.id) || [];
        models.forEach((model: string) => {
          this.modelMap.push({ model, domain });
        });

        if (!this.selectedModel && models.length > 0) {
          this.selectedModel = models[0];
          this.selectedDomain = domain;
        }
      },
      error: (err) => {
        console.error(`Error fetching from ${domain}:`, err);
      },
    });
  }

  changeTheme(theme: string) {
    this.currentTheme = theme || 'light-theme';
    this.themeService.setTheme(theme as 'light-theme' | 'dark-theme');

    if (this.isBrowser) {
      this.document.cookie = `ca-theme=${theme}; path=/; max-age=31536000`; // 1 year
    }
  }

  selectModel(model: string) {
    this.selectedModel = model;
    const found = this.modelMap.find((m) => m.model === model);
    this.selectedDomain = found?.domain || '';
    this.dropdownOpen = false;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  closeModelDropdown(event: Event) {
    if (!this.isBrowser) return; // ✅ Prevent SSR errors

    const target = event.target as HTMLElement;
    const clickedOnModel = target.closest('.model-selector');
    const clickedOnProfile = target.closest('[mat-menu-trigger-for]');

    // Don't close if clicked on model selector or profile trigger
    if (!clickedOnModel && !clickedOnProfile) {
      this.dropdownOpen = false;
    }
  }

  goToSettings() {
    this.dialog.open(SettingsDialog, {
      width: '950px',
      height: '600px',
      maxWidth: 'none',
      panelClass: 'setting-dialog-model',
    });
  }

  getToken() {
    if (!this.isBrowser) return; // ✅ SSR safety

    const loginData = {
      email: 'alice.smith123@example.com',
      password: 'newsecurepass123',
    };

    this.http.post<LoginResponse>(`https://micro-scale.software/api/login`, loginData).subscribe({
      next: (response) => {
        sessionStorage.setItem('jwt', response.JWT_Token);
        this.fetchAccountDetails();
      },
      error: (err) => {
        console.error('Login error:', err);
      },
    });
  }

  fetchAccountDetails() {
    if (!this.isBrowser) return; // ✅ SSR safety

    const token = sessionStorage.getItem('jwt');
    if (!token) return;

    this.http
      .get<any>('https://micro-scale.software/api/account', {
        headers: {
          Authorization: token,
        },
      })
      .subscribe({
        next: (res) => {
          const name = res?.account?.name || '';
          this.userInitial = this.getInitials(name);
          this.userService.setUser({
            name: name,
            email: res.account.email,
            initial: this.userInitial,
          });
        },
        error: (err) => {
          console.error('Error fetching account info:', err);
        },
      });
  }

  getInitials(name: string): string {
    const names = name.trim().split(' ');
    const first = names[0]?.charAt(0).toUpperCase() || '';
    const second = names[1]?.charAt(0).toUpperCase() || '';
    return first + second;
  }
}
