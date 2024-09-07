import type { ReactNode } from 'react';

export type Notification = {
  type: 'success' | 'warning' | 'error' | 'info';
  message: ReactNode;
};
