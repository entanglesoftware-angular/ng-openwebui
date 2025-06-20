import { Component,ViewEncapsulation,Output,EventEmitter } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HostListener } from '@angular/core';
import { NgClass, NgFor, NgIf} from '@angular/common';
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
import { ViewChild } from '@angular/core';
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
    MatSelectModule,
    NgClass,NgIf,NgFor,
    MatInputModule,
    MatIcon,
    MatMenuModule,
    MatButtonModule,
    MatToolbar,
    MatCard
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
  encapsulation: ViewEncapsulation.None
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
  domain: string = '';
  userInitial: string = '';
  domains: string[] = [
    'http://localhost:8000',
    'http://localhost:8001',
    'http://localhost:8002',
    'http://localhost:8003',
    'http://localhost:8004',
  ];
  selectedIndex: number = 0;
   constructor(
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.getToken();
    this.fetchModels();
    document.addEventListener(
      'click',
      this.closeModelDropdown.bind(this)
    );
    if (
    !sessionStorage.getItem('jwt')
  ) {
    this.getToken();
  } else {
    this.fetchAccountDetails();
  }

  }

  fetchModels() {
    this.domain = this.domains[this.selectedIndex];
    for (const domain of this.domains) {
      this.http.get<any>(`${domain}/v1/models`).subscribe({
        next: (res) => {
          const models = res?.data?.map((m: any) => m.id) || [];
          models.forEach((model: string) => {
            this.modelMap.push({ model, domain });
          });

          if (!this.selectedModel) {
            this.selectedModel = models[0];
            this.selectedDomain = domain;
          }
        },
        error: (err) => {
          console.error(`Error fetching from ${domain}:`, err);
        },
      });
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
    height:'600px',
  maxWidth: 'none',
  });
}

 getToken() {
    const loginData = {
      email: 'alice.smith123@example.com',
      password: 'newsecurepass123',
    };
    this.http
      .post<LoginResponse>(`https://micro-scale.software/api/login`, loginData)
      .subscribe({
        next: (response) => {
          sessionStorage.setItem('jwt', response.JWT_Token);
        },
        error: (err) => {
          console.error('Login error:', err);
        },
      });
  }

  fetchAccountDetails() {
  const token = sessionStorage.getItem('jwt');
  if (!token) return;

  this.http.get<any>('https://micro-scale.software/api/account', {
    headers: {
      Authorization: token,
    },
  }).subscribe({
    next: (res) => {
      const name = res?.account?.name || '';
      this.userInitial = this.getInitials(name);
      this.userService.setUser({
        name: name,
        email: res.account.email,
        initial: this.userInitial
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
