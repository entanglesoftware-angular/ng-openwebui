import { Provider } from '@angular/core';
import { NG_OPEN_WEB_UI_CONFIG } from './ng-openwebui-config.token';
import { NgOpenwebUIConfig } from './ng-openwebui-config';
import { NgOpenwebUIConfigValidator } from '../services/ng-openwebui-config-validator.service';

export function provideNgOpenwebUIConfig(config: NgOpenwebUIConfig): Provider {
  return [
    { provide: NG_OPEN_WEB_UI_CONFIG, useValue: config },
    NgOpenwebUIConfigValidator
  ];
}
