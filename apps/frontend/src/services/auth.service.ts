import { IAuthResponse, IUser } from '@snooze/shared-types';
import apiClient from './apiClient';

export const register = async (username: string, email: string, password: string): Promise<IAuthResponse> => {
  const response = await apiClient.post('/auth/register', { username, email, password });
  return response.data;
};

export const login = async (identifier: string, password: string): Promise<IAuthResponse> => {
  const response = await apiClient.post('/auth/login', { identifier, password });
  return response.data;
};

export const refresh = async (refreshToken: string): Promise<IAuthResponse> => {
  const response = await apiClient.post('/auth/refresh', { refresh_token: refreshToken });
  return response.data;
};

export const logout = async (token: string) => {
  await apiClient.post('/auth/logout', {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getProfile = async (token: string): Promise<IUser> => {
  const response = await apiClient.get('/auth/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
