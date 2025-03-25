export interface ILiteUser {
  id: string;
  username: string;
}

export interface IUser extends ILiteUser {
  email: string;
}

export interface IServer {
  id: string;
  name: string;
  creatorId: string;
  creator: string;
  createdAt: string;
  tags?: string[];
}

export interface IServerMember {
  id: string;
  role: string;
  userId: string;
  serverId: string;
  user: ILiteUser;
}

export interface IChannel {
  id: string;
  name: string;
  type: 'TEXT' | 'VOICE';
  serverId: string;
  peers: IServerMember[];
}

export interface IMessage {
  id: string;
  content: string;
  userId: string;
  channelId: string;
  serverId: string;
  username: string;
  createdAt: string;
}

export interface IAuthResponse {
  access_token: string;
  refresh_token: string;
}
