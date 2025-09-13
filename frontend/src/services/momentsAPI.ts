import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL;

if (!API) {
  console.error('VITE_API_BASE_URL is not defined in environment variables');
}

export const fetchMoments = async () => {
  try {
    const response = await axios.get(`${API}/api/moments`, { 
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching moments:', error);
    throw error;
  }
};

export const likeMoment = async (momentId: string, userId: string) => {
  try {
    const response = await axios.post(
      `${API}/api/moments/${momentId}/like`,
      { userId },
      { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error liking moment:', error);
    throw error;
  }
};

export const addComment = async (momentId: string, text: string, userId: string) => {
  try {
    const response = await axios.post(
      `${API}/api/moments/${momentId}/comment`,
      { text, userId },
      { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};