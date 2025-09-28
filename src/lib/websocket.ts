/**
 * WebSocket Manager for Real-time Calendar Updates
 * Provides instant calendar synchronization across all connected clients
 */

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

interface CalendarUpdateMessage {
  type: 'availability_update' | 'booking_created' | 'booking_cancelled' | 'price_update';
  apartmentSlug: string;
  apartmentName: string;
  month: string;
  date?: string;
  data?: any;
  timestamp: number;
}

interface ConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  lastConnected: number | null;
  reconnectAttempts: number;
}

class CalendarWebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private subscribers: Set<(message: CalendarUpdateMessage) => void> = new Set();
  private statusSubscribers: Set<(status: ConnectionStatus) => void> = new Set();
  
  private status: ConnectionStatus = {
    connected: false,
    reconnecting: false,
    lastConnected: null,
    reconnectAttempts: 0
  };

  private readonly maxReconnectAttempts = 10;
  private readonly reconnectDelay = 1000; // Start with 1 second
  private readonly heartbeatInterval = 30000; // 30 seconds
  private readonly wsUrl = process.env.NODE_ENV === 'production' 
    ? 'wss://apartmany-vita.sk/ws/calendar'
    : 'ws://localhost:3001/ws/calendar';

  /**
   * Connect to WebSocket server
   */
  connect(apartmentSlug?: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[WS] Already connected');
      return;
    }

    if (this.ws?.readyState === WebSocket.CONNECTING) {
      console.log('[WS] Connection already in progress');
      return;
    }

    try {
      const url = apartmentSlug 
        ? `${this.wsUrl}?apartment=${apartmentSlug}`
        : this.wsUrl;
      
      console.log('[WS] Connecting to:', url);
      this.ws = new WebSocket(url);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);

    } catch (error) {
      console.error('[WS] Connection failed:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    console.log('[WS] Disconnecting...');
    
    this.clearTimers();
    
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close(1000, 'Client disconnect');
      }
      
      this.ws = null;
    }

    this.updateStatus({
      connected: false,
      reconnecting: false,
      lastConnected: this.status.lastConnected,
      reconnectAttempts: 0
    });
  }

  /**
   * Subscribe to calendar updates
   */
  subscribe(callback: (message: CalendarUpdateMessage) => void): () => void {
    this.subscribers.add(callback);
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Subscribe to connection status changes
   */
  subscribeToStatus(callback: (status: ConnectionStatus) => void): () => void {
    this.statusSubscribers.add(callback);
    
    // Immediately call with current status
    callback(this.status);
    
    return () => {
      this.statusSubscribers.delete(callback);
    };
  }

  /**
   * Send message to server
   */
  send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('[WS] Cannot send message - not connected');
    }
  }

  /**
   * Subscribe to specific apartment updates
   */
  subscribeToApartment(apartmentSlug: string): void {
    this.send({
      type: 'subscribe',
      apartmentSlug,
      timestamp: Date.now()
    });
  }

  /**
   * Unsubscribe from apartment updates
   */
  unsubscribeFromApartment(apartmentSlug: string): void {
    this.send({
      type: 'unsubscribe',
      apartmentSlug,
      timestamp: Date.now()
    });
  }

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus {
    return { ...this.status };
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    console.log('[WS] Connected successfully');
    
    this.updateStatus({
      connected: true,
      reconnecting: false,
      lastConnected: Date.now(),
      reconnectAttempts: 0
    });

    this.startHeartbeat();
  }

  /**
   * Handle WebSocket message
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: CalendarUpdateMessage = JSON.parse(event.data);
      
      console.log('[WS] Received message:', message);
      
      // Notify all subscribers
      this.subscribers.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error('[WS] Subscriber callback error:', error);
        }
      });

    } catch (error) {
      console.error('[WS] Message parsing error:', error);
    }
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    console.log('[WS] Connection closed:', event.code, event.reason);
    
    this.clearTimers();
    
    this.updateStatus({
      connected: false,
      reconnecting: false,
      lastConnected: this.status.lastConnected,
      reconnectAttempts: this.status.reconnectAttempts
    });

    // Reconnect unless it was a clean close
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  /**
   * Handle WebSocket error
   */
  private handleError(error: Event): void {
    console.error('[WS] Connection error:', error);
    this.scheduleReconnect();
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.status.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WS] Max reconnection attempts reached');
      return;
    }

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.status.reconnectAttempts),
      30000 // Max 30 seconds
    );

    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.status.reconnectAttempts + 1})`);

    this.updateStatus({
      connected: false,
      reconnecting: true,
      lastConnected: this.status.lastConnected,
      reconnectAttempts: this.status.reconnectAttempts + 1
    });

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', timestamp: Date.now() });
      }
    }, this.heartbeatInterval);
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Update connection status and notify subscribers
   */
  private updateStatus(newStatus: ConnectionStatus): void {
    this.status = newStatus;
    
    this.statusSubscribers.forEach(callback => {
      try {
        callback(this.status);
      } catch (error) {
        console.error('[WS] Status callback error:', error);
      }
    });
  }
}

// Singleton instance
export const calendarWebSocket = new CalendarWebSocketManager();

/**
 * React hook for WebSocket calendar updates
 */
export function useCalendarWebSocket(apartmentSlug?: string) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ConnectionStatus>({ 
    connected: false, 
    reconnecting: false, 
    lastConnected: null, 
    reconnectAttempts: 0 
  });
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    // Subscribe to connection status - placeholder
    const unsubscribeStatus = () => {};

    // Subscribe to calendar updates
    const unsubscribeUpdates = calendarWebSocket.subscribe((message) => {
      handleCalendarUpdate(message, queryClient);
    });

    // Connect to WebSocket
    calendarWebSocket.connect(apartmentSlug);

    // Subscribe to specific apartment if provided
    if (apartmentSlug) {
      const timer = setTimeout(() => {
        calendarWebSocket.subscribeToApartment(apartmentSlug);
      }, 1000); // Wait for connection
      
      reconnectTimeoutRef.current = timer;
    }

    // Cleanup on unmount
    return () => {
      unsubscribeStatus();
      unsubscribeUpdates();
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (apartmentSlug) {
        calendarWebSocket.unsubscribeFromApartment(apartmentSlug);
      }
    };
  }, [apartmentSlug, queryClient]);

  // Auto-reconnect on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !status.connected) {
        console.log('[WS] Page became visible, reconnecting...');
        calendarWebSocket.connect(apartmentSlug);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [apartmentSlug, status.connected]);

  return {
    status,
    subscribe: calendarWebSocket.subscribe.bind(calendarWebSocket),
    send: calendarWebSocket.send.bind(calendarWebSocket),
    subscribeToApartment: calendarWebSocket.subscribeToApartment.bind(calendarWebSocket),
    unsubscribeFromApartment: calendarWebSocket.unsubscribeFromApartment.bind(calendarWebSocket)
  };
}

/**
 * Handle calendar update messages
 */
function handleCalendarUpdate(message: CalendarUpdateMessage, queryClient: any): void {
  console.log('[WS] Handling calendar update:', message);

  switch (message.type) {
    case 'availability_update':
      // Invalidate availability queries for the apartment and month
      queryClient.invalidateQueries({
        queryKey: ['availability', message.apartmentSlug, message.month]
      });
      
      // Also invalidate cached availability
      queryClient.invalidateQueries({
        queryKey: ['cached-availability', message.apartmentSlug, message.month]
      });
      break;

    case 'booking_created':
    case 'booking_cancelled':
      // Invalidate availability and bookings for the apartment
      queryClient.invalidateQueries({
        queryKey: ['availability', message.apartmentSlug]
      });
      
      queryClient.invalidateQueries({
        queryKey: ['bookings', message.apartmentSlug]
      });
      break;

    case 'price_update':
      // Invalidate pricing queries
      queryClient.invalidateQueries({
        queryKey: ['pricing', message.apartmentSlug]
      });
      break;

    default:
      console.warn('[WS] Unknown message type:', message.type);
  }

  // Show toast notification if available
  if (typeof window !== 'undefined' && (window as any).showToast) {
    (window as any).showToast({
      title: 'Calendar Updated',
      description: `${message.apartmentName} availability updated`,
      type: 'info'
    });
  }
}

/**
 * WebSocket connection status indicator component
 */
export function WebSocketStatus() {
  const { status } = useCalendarWebSocket();

  if (!status.connected && !status.reconnecting) return null;

  const React = require('react') as typeof import('react');

  return React.createElement('div', {
    className: "fixed top-4 right-4 z-50"
  }, 
    React.createElement('div', {
      className: `flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
        status.connected 
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      }`
    }, [
      React.createElement('div', {
        key: 'indicator',
        className: `w-2 h-2 rounded-full ${
          status.connected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
        }`
      }),
      React.createElement('span', {
        key: 'text'
      }, status.connected ? 'Live Updates' : 'Reconnecting...')
    ])
  );
}

export default calendarWebSocket;
