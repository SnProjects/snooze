import apiClient from './apiClient';

export const createWhiteboard = async (name: string, serverId: string, accessToken: string): Promise<any> => {
  try {
    const response = await apiClient.post('/whiteboards', { name, serverId }, { headers: { Authorization: `Bearer ${accessToken}` } });
    return response.data;
  } catch (error) {
    console.error('Failed to create whiteboard:', error);
    throw error;
  }
};

export const getWhiteboards = async (serverId: string, accessToken: string): Promise<any[]> => {
  try {
    const response = await apiClient.get(`/whiteboards/server/${serverId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch whiteboards:', error);
    throw error;
  }
};

export const getWhiteboard = async (id: string, accessToken: string): Promise<any> => {
  try {
    const response = await apiClient.get(`/whiteboards/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch whiteboard:', error);
    throw error;
  }
};

export const updateWhiteboardData = async (id: string, data: any, accessToken: string): Promise<any> => {
  try {
    const response = await apiClient.post(`/whiteboards/${id}/data`, { data }, { headers: { Authorization: `Bearer ${accessToken}` } });
    return response.data;
  } catch (error) {
    console.error('Failed to update whiteboard data:', error);
    throw error;
  }
};
