// ============================================================
// HOBI Cuisine — Broadcast Service (Cross-Tab Communication)
// ============================================================

import type { BroadcastEvent, BroadcastEventType } from '@/types';

type EventHandler = (event: BroadcastEvent) => void;

class BroadcastService {
  private channel: BroadcastChannel | null = null;
  private handlers: Map<BroadcastEventType, Set<EventHandler>> = new Map();

  init() {
    if (typeof window === 'undefined') return;
    if (this.channel) return;

    this.channel = new BroadcastChannel('hobi_cuisine_orders');
    this.channel.onmessage = (event: MessageEvent<BroadcastEvent>) => {
      const data = event.data;
      const typeHandlers = this.handlers.get(data.type);
      if (typeHandlers) {
        typeHandlers.forEach((handler) => handler(data));
      }
    };
  }

  send(type: BroadcastEventType, payload: unknown) {
    if (!this.channel) this.init();
    const event: BroadcastEvent = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };
    this.channel?.postMessage(event);
  }

  on(type: BroadcastEventType, handler: EventHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    if (!this.channel) this.init();
    return () => this.off(type, handler);
  }

  off(type: BroadcastEventType, handler: EventHandler) {
    this.handlers.get(type)?.delete(handler);
  }

  destroy() {
    this.channel?.close();
    this.channel = null;
    this.handlers.clear();
  }
}

export const broadcastService = new BroadcastService();
