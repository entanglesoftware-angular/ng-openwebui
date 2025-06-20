import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserService {
  private user: { name?: string; email?: string; initial?: string } = {};

  setUser(user: { name?: string; email?: string; initial?: string }) {
    this.user = user;
  }

  getUser() {
    return this.user;
  }
}
