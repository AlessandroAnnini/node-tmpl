import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';

// Endpoint configuration
const AUTH_URL =
  process.env['AUTH_URL'] || 'https://workspace-auth.example.com/oauth/token';
const EXTERNAL_SERVICE_URL =
  process.env['EXTERNAL_SERVICE_URL'] ||
  'https://workspace-api.example.com/api/v1';
const CLIENT_ID = process.env['CLIENT_ID'];
const CLIENT_SECRET = process.env['CLIENT_SECRET'];
const GRANT_TYPE = process.env['GRANT_TYPE']; // M2M authentication Grant type

if (!AUTH_URL || !EXTERNAL_SERVICE_URL || !CLIENT_ID || !CLIENT_SECRET) {
  throw new Error('Missing required environment variables');
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

let token: string | null = null;
let tokenExpiry: number | null = null;

// New token generation
async function getNewToken(): Promise<string> {
  try {
    const response = await axios.post<TokenResponse>(
      AUTH_URL,
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: GRANT_TYPE,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const { access_token, expires_in } = response.data;
    token = access_token;
    tokenExpiry = Date.now() + expires_in * 1000;

    return access_token;
  } catch (error) {
    console.error(
      'Error renewing token:',
      error instanceof Error ? error.message : 'Unknown error occurred',
    );
    throw error;
  }
}

// Verify if the token is valid or expired
async function getValidToken(): Promise<string> {
  if (!token || !tokenExpiry || Date.now() >= tokenExpiry) {
    return await getNewToken();
  }
  return token;
}

// Axios client creation
async function createApiClient(): Promise<AxiosInstance> {
  const accessToken = await getValidToken();

  const client = axios.create({
    baseURL: EXTERNAL_SERVICE_URL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  // Add response interceptor for token refresh
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response && error.response.status === 401) {
        // Token might be expired, try to get a new one
        const newToken = await getNewToken();
        if (error.config) {
          error.config.headers['Authorization'] = `Bearer ${newToken}`;
          return axios(error.config);
        }
      }
      return Promise.reject(error);
    },
  );

  return client;
}

export { createApiClient };

// // Example of using the client to call Workspace APIs
// async function fetchWorkspaces() {
//   try {
//     const apiClient = await createApiClient();
//     const response = await apiClient.get('/workspaces');
//     console.log('Workspace data:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error(
//       'Error fetching data:',
//       error instanceof Error ? error.message : 'Unknown error occurred',
//     );
//     throw error;
//   }
// }

// // Execute the example data fetch
// fetchWorkspaces().catch((error) => {
//   console.error('Failed to fetch workspaces:', error);
// });
