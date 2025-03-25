import { IChannel } from '@snooze/shared-types';
import apiClient from './apiClient';

export const getChannels = async (
  serverId: string,
  accessToken: string,
): Promise<IChannel[]> => {
  const response = await apiClient.get(`/channels/${serverId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

export const getTextChannels = async (
  serverId: string,
  accessToken: string,
): Promise<IChannel[]> => {
  const response = await apiClient.get(`/channels/${serverId}/text`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

export const getVoiceChannels = async (
  serverId: string,
  accessToken: string,
): Promise<IChannel[]> => {
  const response = await apiClient.get(`/channels/${serverId}/voice`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

export const createChannel = async (
  name: string,
  serverId: string,
  type: 'TEXT' | 'VOICE',
  accessToken: string,
): Promise<IChannel> => {
  const response = await apiClient.post(
    '/channels',
    { name, serverId, type },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  return response.data;
};
