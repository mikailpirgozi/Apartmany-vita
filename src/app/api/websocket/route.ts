/**
 * WebSocket API Route for Real-time Calendar Updates
 * Handles WebSocket connections for live calendar synchronization
 */

import { NextRequest } from 'next/server';

// WebSocket connection manager
class WebSocketConnectionManager {
  private connections = new Map<string, WebSocket>();
  private apartmentSubscriptions = new Map<string, Set<string>>();

  /**
   * Add new WebSocket connection
   */
  addConnection(id: string, ws: WebSocket, apartmentSlug?: string): void {
    this.connections.set(id, ws);
    
    if (apartmentSlug) {
      this.subscribeToApartment(id, apartmentSlug);
    }

    console.log(`[WS Server] Connection added: ${id} (total: ${this.connections.size})`);
  }

  /**
   * Remove WebSocket connection
   */
  removeConnection(id: string): void {
    this.connections.delete(id);
    
    // Remove from all apartment subscriptions
    for (const [apartment, subscribers] of this.apartmentSubscriptions.entries()) {
      subscribers.delete(id);
      if (subscribers.size === 0) {
        this.apartmentSubscriptions.delete(apartment);
      }
    }

    console.log(`[WS Server] Connection removed: ${id} (total: ${this.connections.size})`);
  }

  /**
   * Subscribe connection to apartment updates
   */
  subscribeToApartment(connectionId: string, apartmentSlug: string): void {
    if (!this.apartmentSubscriptions.has(apartmentSlug)) {
      this.apartmentSubscriptions.set(apartmentSlug, new Set());
    }
    
    this.apartmentSubscriptions.get(apartmentSlug)!.add(connectionId);
    console.log(`[WS Server] ${connectionId} subscribed to ${apartmentSlug}`);
  }

  /**
   * Unsubscribe connection from apartment updates
   */
  unsubscribeFromApartment(connectionId: string, apartmentSlug: string): void {
    const subscribers = this.apartmentSubscriptions.get(apartmentSlug);
    if (subscribers) {
      subscribers.delete(connectionId);
      if (subscribers.size === 0) {
        this.apartmentSubscriptions.delete(apartmentSlug);
      }
    }
    console.log(`[WS Server] ${connectionId} unsubscribed from ${apartmentSlug}`);
  }

  /**
   * Broadcast message to all connections subscribed to apartment
   */
  broadcastToApartment(apartmentSlug: string, message: any): void {
    const subscribers = this.apartmentSubscriptions.get(apartmentSlug);
    if (!subscribers) return;

    const messageStr = JSON.stringify(message);
    let sentCount = 0;

    for (const connectionId of subscribers) {
      const ws = this.connections.get(connectionId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(messageStr);
          sentCount++;
        } catch (error) {
          console.error(`[WS Server] Failed to send to ${connectionId}:`, error);
          this.removeConnection(connectionId);
        }
      }
    }

    console.log(`[WS Server] Broadcasted to ${sentCount} connections for ${apartmentSlug}`);
  }

  /**
   * Broadcast to all connections
   */
  broadcastToAll(message: any): void {
    const messageStr = JSON.stringify(message);
    let sentCount = 0;

    for (const [id, ws] of this.connections.entries()) {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(messageStr);
          sentCount++;
        } catch (error) {
          console.error(`[WS Server] Failed to send to ${id}:`, error);
          this.removeConnection(id);
        }
      }
    }

    console.log(`[WS Server] Broadcasted to ${sentCount} connections`);
  }

  /**
   * Get connection statistics
   */
  getStats(): {
    totalConnections: number;
    apartmentSubscriptions: number;
    connectionsPerApartment: Record<string, number>;
  } {
    const connectionsPerApartment: Record<string, number> = {};
    
    for (const [apartment, subscribers] of this.apartmentSubscriptions.entries()) {
      connectionsPerApartment[apartment] = subscribers.size;
    }

    return {
      totalConnections: this.connections.size,
      apartmentSubscriptions: this.apartmentSubscriptions.size,
      connectionsPerApartment
    };
  }
}

// Global connection manager
const wsManager = new WebSocketConnectionManager();

/**
 * WebSocket upgrade handler
 */
export async function GET(request: NextRequest) {
  // Check if this is a WebSocket upgrade request
  const upgrade = request.headers.get('upgrade');
  if (upgrade !== 'websocket') {
    return new Response('Expected WebSocket upgrade', { status: 400 });
  }

  try {
    // Get apartment from query params
    const url = new URL(request.url);
    const apartmentSlug = url.searchParams.get('apartment');
    
    // Create WebSocket connection
    const { socket, response } = Deno.upgradeWebSocket(request);
    const connectionId = generateConnectionId();

    // Handle WebSocket events
    socket.onopen = () => {
      wsManager.addConnection(connectionId, socket, apartmentSlug || undefined);
      
      // Send welcome message
      socket.send(JSON.stringify({
        type: 'connected',
        connectionId,
        apartmentSlug,
        timestamp: Date.now()
      }));
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(connectionId, message);
      } catch (error) {
        console.error('[WS Server] Message parsing error:', error);
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format',
          timestamp: Date.now()
        }));
      }
    };

    socket.onclose = () => {
      wsManager.removeConnection(connectionId);
    };

    socket.onerror = (error) => {
      console.error('[WS Server] Socket error:', error);
      wsManager.removeConnection(connectionId);
    };

    return response;

  } catch (error) {
    console.error('[WS Server] WebSocket upgrade failed:', error);
    return new Response('WebSocket upgrade failed', { status: 500 });
  }
}

/**
 * Handle incoming WebSocket messages
 */
function handleWebSocketMessage(connectionId: string, message: any): void {
  console.log(`[WS Server] Message from ${connectionId}:`, message);

  switch (message.type) {
    case 'subscribe':
      if (message.apartmentSlug) {
        wsManager.subscribeToApartment(connectionId, message.apartmentSlug);
      }
      break;

    case 'unsubscribe':
      if (message.apartmentSlug) {
        wsManager.unsubscribeFromApartment(connectionId, message.apartmentSlug);
      }
      break;

    case 'ping':
      // Respond to heartbeat
      const ws = wsManager.connections.get(connectionId);
      if (ws) {
        ws.send(JSON.stringify({
          type: 'pong',
          timestamp: Date.now()
        }));
      }
      break;

    default:
      console.warn(`[WS Server] Unknown message type: ${message.type}`);
  }
}

/**
 * Generate unique connection ID
 */
function generateConnectionId(): string {
  return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Broadcast calendar update to all relevant connections
 */
export function broadcastCalendarUpdate(
  apartmentSlug: string,
  apartmentName: string,
  type: 'availability_update' | 'booking_created' | 'booking_cancelled' | 'price_update',
  month: string,
  date?: string,
  data?: any
): void {
  const message = {
    type,
    apartmentSlug,
    apartmentName,
    month,
    date,
    data,
    timestamp: Date.now()
  };

  wsManager.broadcastToApartment(apartmentSlug, message);
}

/**
 * Get WebSocket statistics
 */
export function getWebSocketStats() {
  return wsManager.getStats();
}

// Export the manager for use in other parts of the application
export { wsManager };

/**
 * POST endpoint for triggering broadcasts (for testing/admin)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apartmentSlug, type, message } = body;

    if (!apartmentSlug || !type) {
      return new Response('Missing required fields', { status: 400 });
    }

    // Broadcast the message
    wsManager.broadcastToApartment(apartmentSlug, {
      type,
      apartmentSlug,
      ...message,
      timestamp: Date.now()
    });

    return Response.json({ 
      success: true, 
      stats: wsManager.getStats() 
    });

  } catch (error) {
    console.error('[WS Server] POST error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
