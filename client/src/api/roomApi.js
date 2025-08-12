import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1/room'; 

export const createRoom = async (roomData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/create`, roomData);
    return response.data;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

export const joinRoom = async ({ roomId, username }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/join`, { roomId, username });
    return response.data;
  } catch (error) {
    console.error('Error joining room:', error);
    throw error;
  }
};