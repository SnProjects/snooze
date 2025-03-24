import { Server } from '@snooze/shared-types';
import apiClient from './apiClient';

export const getServers = async (accessToken: string): Promise<Server[]> => {
  const response = await apiClient.get('/servers', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

export const createServer = async (
  name: string,
  accessToken: string,
): Promise<Server> => {
  const response = await apiClient.post(
    '/servers',
    { name },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  return response.data;
};

export const getUsersInServer = async (
  serverId: number,
  accessToken: string,
): Promise<any[]> => {
  const response = await apiClient.get(`/servers/${serverId}/users`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

export const joinServer = async (
  serverId: number,
  accessToken: string,
): Promise<Server> => {
  const response = await apiClient.post(
    `/servers/${serverId}/join`,
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  return response.data;
};
