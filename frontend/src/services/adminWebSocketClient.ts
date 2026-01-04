

import { API_CONFIG } from '../config/api';
import TokenManager from '../utils/tokenManager';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface DashboardUpdate {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    pendingApprovals: number;
  };
  artworkStats: {
    totalArtworks: number;
    pendingApproval: number;
    approvedArtworks: number;
    featuredArtworks: number;
  };
  orderStats: {
    totalOrders: number;
    pendingOrders: number;
    shippedOrders: number;
    totalRevenue: number;
  };
  systemHealth: {
    status: string;
    activeServices: number;
    totalServices: number;
    cpuUsage: number;
    memoryUsage: number;
  };
}

export interface NotificationMessage {
  type: 'ORDER' | 'USER' | 'ARTWORK' | 'SYSTEM';
  severity: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  timestamp: string;
  data?: any;
}

type MessageHandler = (data: any) => void;

class AdminWebSocketClient {
  private stompClient: Client | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private isManualDisconnect = false;
  private subscriptions: Map<string, StompSubscription> = new Map();

  
  private isWebSocketEnabled = true;

  constructor() {
    if (!this.isWebSocketEnabled) {
      console.info('ℹ️ Admin WebSocket is disabled (backend not configured)');
      return;
    }
    if (!API_CONFIG.ADMIN_WEBSOCKET_URL) {
      console.warn('❌ Admin WebSocket URL not configured');
    }
  }

  
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      
      if (!this.isWebSocketEnabled) {
        console.info('ℹ️ Skipping WebSocket connection (disabled)');
        resolve();
        return;
      }

      if (this.stompClient && this.stompClient.connected) {
        console.log('✅ WebSocket already connected');
        resolve();
        return;
      }

      if (!API_CONFIG.ADMIN_WEBSOCKET_URL) {
        console.error('❌ Admin WebSocket URL not configured');
        reject(new Error('WebSocket URL not configured'));
        return;
      }

      const token = TokenManager.getToken();
      if (!token) {
        console.error('❌ No authentication token for WebSocket');
        reject(new Error('Authentication required'));
        return;
      }

      this.isManualDisconnect = false;

      try {
        console.log('🔌 Connecting to Admin WebSocket:', API_CONFIG.ADMIN_WEBSOCKET_URL);
        
        this.stompClient = new Client({
          
          webSocketFactory: () => {
            
            const url = API_CONFIG.ADMIN_WEBSOCKET_URL
              .replace('wss://', 'https://')
              .replace('ws://', 'http://');
            return new SockJS(url);
          },

          connectHeaders: {
            'Authorization': `Bearer ${token}`
          },

          debug: (str) => {
            if (str.includes('ERROR')) {
              console.error('STOMP:', str);
            }
          },

          reconnectDelay: this.reconnectInterval,
          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,

          onConnect: () => {
            console.log('✅ Admin WebSocket connected via STOMP');
            this.reconnectAttempts = 0;
            resolve();
          },

          onStompError: (frame) => {
            console.error('❌ STOMP error:', frame.headers['message']);
            console.error('Error details:', frame.body);
            reject(new Error(frame.headers['message'] || 'STOMP connection error'));
          },

          onWebSocketClose: (event) => {
            console.log('🔌 WebSocket closed:', event.code);

            if (!this.isManualDisconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
              this.attemptReconnect();
            }
          },

          onWebSocketError: (error) => {
            console.error('❌ WebSocket error:', error);
          }
        });

        this.stompClient.activate();

      } catch (error) {
        console.error('❌ Error creating STOMP connection:', error);
        reject(error);
      }
    });
  }

  
  disconnect(): void {
    console.log('🔌 Manually disconnecting WebSocket');
    this.isManualDisconnect = true;

    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }

    this.subscriptions.clear();
  }

  
  private attemptReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch(error => {
        console.error('❌ Reconnection failed:', error);
      });
    }, delay);
  }

  
  private subscribe(destination: string, handler: MessageHandler): () => void {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('❌ Cannot subscribe: not connected');
      return () => { };
    }

    const subscription = this.stompClient.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        handler(data);
      } catch (error) {
        console.error(`❌ Error parsing message from ${destination}:`, error);
      }
    });

    this.subscriptions.set(destination, subscription);

    
    return () => {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    };
  }

  
  subscribeToDashboard(handler: (data: DashboardUpdate) => void): () => void {
    return this.subscribe('/topic/dashboard', handler);
  }

  
  subscribeToOrderNotifications(handler: (notification: NotificationMessage) => void): () => void {
    return this.subscribe('/topic/admin/orders', handler);
  }

  
  subscribeToUserNotifications(handler: (notification: NotificationMessage) => void): () => void {
    return this.subscribe('/topic/admin/users', handler);
  }

  
  subscribeToArtworkNotifications(handler: (notification: NotificationMessage) => void): () => void {
    return this.subscribe('/topic/admin/artworks', handler);
  }

  
  subscribeToSystemAlerts(handler: (alert: NotificationMessage) => void): () => void {
    return this.subscribe('/topic/admin/alerts', handler);
  }

  
  isConnected(): boolean {
    return this.stompClient !== null && this.stompClient.connected;
  }

  
  getState(): string {
    if (!this.stompClient) return 'DISCONNECTED';
    return this.stompClient.connected ? 'CONNECTED' : 'DISCONNECTED';
  }
}


export const adminWebSocketClient = new AdminWebSocketClient();
export default AdminWebSocketClient;
