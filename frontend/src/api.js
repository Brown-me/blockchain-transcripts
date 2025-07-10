import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

export const uploadTranscript = (data) => {
  return axios.post(`${API_BASE}/upload`, data);
};

export const verifyTranscript = (data) => {
  return axios.post(`${API_BASE}/verify`, data);
};
