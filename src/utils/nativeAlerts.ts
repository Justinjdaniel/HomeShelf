/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type HapticType = 'tap' | 'success' | 'warning' | 'critical' | 'consume' | 'restock';

export interface NativeHUDMessage {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'critical';
  icon?: string;
  timestamp: number;
}

type HUDListener = (hud: NativeHUDMessage | null) => void;
const hudListeners: Set<HUDListener> = new Set();
let activeHUD: NativeHUDMessage | null = null;
let hudTimeout: NodeJS.Timeout | null = null;

export function subscribeToHUD(listener: HUDListener): () => void {
  hudListeners.add(listener);
  listener(activeHUD);
  return () => {
    hudListeners.delete(listener);
  };
}

/**
 * Triggers native device haptic vibration feedback where supported.
 */
export function triggerHaptic(type: HapticType = 'tap'): void {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

  try {
    switch (type) {
      case 'tap':
        navigator.vibrate(15);
        break;
      case 'success':
      case 'restock':
        navigator.vibrate([25, 40, 30]);
        break;
      case 'consume':
        navigator.vibrate([35, 30, 20]);
        break;
      case 'warning':
        navigator.vibrate([50, 60, 50]);
        break;
      case 'critical':
        navigator.vibrate([70, 60, 70, 60, 120]);
        break;
    }
  } catch {
    // Ignore unsupported devices
  }
}

/**
 * Request permission for native system notifications.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

/**
 * Triggers a native WebAPI notification and/or mobile system HUD banner.
 */
export function triggerNativeAlert(options: {
  title: string;
  body: string;
  type?: 'info' | 'success' | 'warning' | 'critical';
  icon?: string;
  soundOrHaptic?: boolean;
}): void {
  const { title, body, type = 'info', icon, soundOrHaptic = true } = options;

  if (soundOrHaptic) {
    triggerHaptic(type === 'critical' ? 'critical' : type === 'warning' ? 'warning' : 'success');
  }

  // 1. Dispatch in-app native system HUD banner
  const hudItem: NativeHUDMessage = {
    id: `hud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title,
    body,
    type,
    icon: icon || (type === 'critical' ? 'priority_high' : type === 'warning' ? 'warning' : 'check_circle'),
    timestamp: Date.now(),
  };

  activeHUD = hudItem;
  hudListeners.forEach((fn) => fn(activeHUD));

  if (hudTimeout) clearTimeout(hudTimeout);
  hudTimeout = setTimeout(() => {
    activeHUD = null;
    hudListeners.forEach((fn) => fn(null));
  }, type === 'critical' ? 4500 : 3200);

  // 2. Dispatch browser/system native Web Notification if allowed
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: `homeshelf_${type}`,
        silent: !soundOrHaptic,
      });
    } catch {
      // Ignore background restrictions
    }
  }
}
