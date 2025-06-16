import { Injectable, Inject } from '@angular/core';
import { COMMERCE_AI_CONFIG  } from '../config/commerceai-config.token';
import { CommerceAIConfig } from '../config/commerceai-config';

@Injectable()
export class CommerceAIConfigValidator {
  constructor(
    @Inject(COMMERCE_AI_CONFIG) private config: CommerceAIConfig
  ) {
    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.config.userId || this.config.userId.trim() === '') {
      throw new Error('CommerceAIConfig Error: "userId" is required but was not provided.');
    }
    if (!this.config.domain || this.config.domain.trim() === '') {
      throw new Error('CommerceAIConfig Error: "domain" is required but was not provided.');
    }
  }

  getConfig(): CommerceAIConfig {
    return this.config;
  }
}
