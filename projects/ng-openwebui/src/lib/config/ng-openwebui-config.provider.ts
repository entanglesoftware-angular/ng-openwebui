import { Provider } from '@angular/core';
import { COMMERCE_AI_CONFIG } from './ng-openwebui-config.token';
import { NgOpenwebUIConfig } from './ng-openwebui-config';
import { NgOpenwebUIConfigValidator } from '../services/ng-openwebui-config-validator.service';

export function provideNgOpenwebUIConfig(config: NgOpenwebUIConfig): Provider {
  return [
    { provide: COMMERCE_AI_CONFIG, useValue: config },
    NgOpenwebUIConfigValidator
  ];
}
