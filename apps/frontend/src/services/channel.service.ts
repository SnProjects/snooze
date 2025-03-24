import { Channel } from '@snooze/shared-types';
import apiClient from './apiClient';

export const getChannels = async (
  serverId: number,
  accessToken: string,
): Promise<Channel[]> => {
  const response = await apiClient.get(`/channels/${serverId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

export const getTextChannels = async (
  serverId: number,
  accessToken: string,
): Promise<Channel[]> => {
  const response = await apiClient.get(`/channels/${serverId}/text`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

export const getVoiceChannels = async (
  serverId: number,
  accessToken: string,
): Promise<Channel[]> => {
  const response = await apiClient.get(`/channels/${serverId}/voice`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

export const createChannel = async (
  name: string,
  serverId: number,
  type: 'TEXT' | 'VOICE',
  accessToken: string,
): Promise<Channel> => {
  const response = await apiClient.post(
    '/channels',
    { name, serverId, type },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  return response.data;
};
