export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Server {
  id: number;
  name: string;
  creatorId: number;
  creator: string;
  createdAt: string;
  tags?: string[];
}

export interface ServerMember {
  id: number;
  username: string;
  role: string;
  userId: number;
  serverId: number;
}

export interface Channel {
  id: number;
  name: string;
  type: 'TEXT' | 'VOICE';
  serverId: number;
}

export interface Message {
  id: number;
  content: string;
  userId: number;
  channelId: number;
  serverId: number;
  username: string;
  createdAt: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}
