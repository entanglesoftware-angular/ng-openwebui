import { Injectable, Inject } from '@angular/core';
import { COMMERCE_AI_CONFIG  } from '../config/ng-openwebui-config.token';
import { NgOpenwebuiConfig } from '../config/ng-openwebui-config';

@Injectable()
export class NgOpenwebuiConfigValidator {
  constructor(
    @Inject(COMMERCE_AI_CONFIG) private config: NgOpenwebuiConfig
  ) {
    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.config.userId || this.config.userId.trim() === '') {
      throw new Error('NgOpenwebuiConfig Error: "userId" is required but was not provided.');
    }
    if (!this.config.domain || this.config.domain.trim() === '') {
      throw new Error('NgOpenwebuiConfig Error: "domain" is required but was not provided.');
    }
  }

  getConfig(): NgOpenwebuiConfig {
    return this.config;
  }
}
