import { Provider } from '@angular/core';
import { COMMERCE_AI_CONFIG } from './ng-openwebui-config.token';
import { NgOpenwebuiConfig } from './ng-openwebui-config';
import { NgOpenwebuiConfigValidator } from '../services/ng-openwebui-config-validator.service';

export function provideNgOpenwebuiConfig(config: NgOpenwebuiConfig): Provider {
  return [
    { provide: COMMERCE_AI_CONFIG, useValue: config },
    NgOpenwebuiConfigValidator
  ];
}
