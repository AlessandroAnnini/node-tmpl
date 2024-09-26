import axios from 'axios';

const EXTERNAL_SERVICE_URL = process.env.EXTERNAL_SERVICE_URL;
const API_KEY = process.env.API_KEY;

if (!EXTERNAL_SERVICE_URL || !API_KEY) {
  throw new Error(
    'EXTERNAL_SERVICE_URL and API_KEY must be set in the .env file'
  );
}

const apiClient = axios.create({
  baseURL: EXTERNAL_SERVICE_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
  },
});

export default apiClient;
