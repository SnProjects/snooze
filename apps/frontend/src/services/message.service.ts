import { IMessage } from '@snooze/shared-types';
import apiClient from './apiClient';

export const getMessages = async (channelId: string, token: string): Promise<IMessage[]> => {
  const response = await apiClient.get('/chat/messages', {
    params: { channelId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
