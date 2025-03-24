import { Message } from '@snooze/shared-types';
import apiClient from './apiClient';

export const getMessages = async (channelId: number, token: string): Promise<Message[]> => {
  const response = await apiClient.get('/chat/messages', {
    params: { channelId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
