import { Provider } from '@angular/core';
import { COMMERCE_AI_CONFIG } from './commerceai-config.token';
import { CommerceAIConfig } from './commerceai-config';
import { CommerceAIConfigValidator } from '../services/commerceai-config-validator.service';

export function provideCommerceAIConfig(config: CommerceAIConfig): Provider {
  return [
    { provide: COMMERCE_AI_CONFIG, useValue: config },
    CommerceAIConfigValidator
  ];
}
