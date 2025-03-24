import io, { Socket } from 'socket.io-client';
import { Message } from '@snooze/shared-types';
import { host } from './apiClient';

export class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, (msg: Message) => void> = new Map();

  connect(token: string) {
    if (this.socket) {
      this.disconnect();
    }
    this.socket = io(host, { auth: { token } });
  }

  onMessage(serverId: number, channelId: number, callback: (msg: Message) => void) {
    if (this.socket) {
      const eventKey = `chatMessage-${serverId}:${channelId}`;
      // Remove any existing listener for this channel to prevent duplicates
      if (this.listeners.has(eventKey)) {
        this.socket.off('chatMessage', this.listeners.get(eventKey));
      }
      const handler = (msg: Message) => {
        if (msg.serverId === serverId && msg.channelId === channelId) {
          console.log('Received message:', msg);
          callback(msg);
        }
      };
      this.socket.on('chatMessage', handler);
      this.listeners.set(eventKey, handler);
    }
  }

  sendMessage(message: string, channelId: number, serverId: number) {
    if (this.socket) {
      this.socket.emit('chatMessage', { message, channelId, serverId });
    }
  }

  disconnect() {
    if (this.socket) {
      this.listeners.forEach((handler, eventKey) => {
        this.socket?.off('chatMessage', handler);
      });
      this.listeners.clear();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
