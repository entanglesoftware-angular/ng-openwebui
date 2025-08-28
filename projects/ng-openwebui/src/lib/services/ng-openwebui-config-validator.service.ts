import { Injectable, Inject } from '@angular/core';
import { NG_OPEN_WEB_UI_CONFIG  } from '../config/ng-openwebui-config.token';
import { NgOpenwebUIConfig } from '../config/ng-openwebui-config';

@Injectable()
export class NgOpenwebUIConfigValidator {
  constructor(
    @Inject(NG_OPEN_WEB_UI_CONFIG) private config: NgOpenwebUIConfig
  ) {
    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.config.userId || this.config.userId.trim() === '') {
      throw new Error('NgOpenwebUIConfig Error: "userId" is required but was not provided.');
    }
    if (!this.config.domain || this.config.domain.trim() === '') {
      throw new Error('NgOpenwebUIConfig Error: "domain" is required but was not provided.');
    }
  }

  getConfig(): NgOpenwebUIConfig {
    return this.config;
  }
}
