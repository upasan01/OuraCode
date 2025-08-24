import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_ROOM_API_URL; 

// The room creation API call
export const createRoom = async (roomData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/create`, roomData);
    return response.data;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

// The joining room API call
export const joinRoom = async ({ roomId, username }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/join`, { roomId, username });
    return response.data;
  } catch (error) {
    console.error('Error joining room:', error);
    throw error;
  }
};