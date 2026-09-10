import { View, AppBuilderTab } from '../types';

/**
 * Strong TypeScript definition for the encrypted route payload
 */
export interface SecureRouteState {
  view: View;
  merchantId?: string;
  tab?: AppBuilderTab;
  modal?: 'qr' | 'view_app' | 'privacy' | 'user_settings' | null;
  timestamp?: number;
  meta?: Record<string, any>;
}

export interface EncryptedRoutingOptions {
  replace?: boolean;
}
