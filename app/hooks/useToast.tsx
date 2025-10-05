/**
 * useToast Hook
 * 
 * Easy toast notification management
 * Usage: const { showToast, ToastComponent } = useToast();
 */

import { useState, useCallback } from 'react';
import { ToastNotification } from '../components/ui';

interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = useCallback((
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration?: number
  ) => {
    setToast({ visible: true, message, type });
    
    // Auto-hide after duration
    if (duration !== 0) {
      setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, duration || 3000);
    }
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  const ToastComponent = (
    <ToastNotification
      message={toast.message}
      type={toast.type}
      visible={toast.visible}
      onHide={hideToast}
    />
  );

  return { showToast, hideToast, ToastComponent };
};
