import axios from 'axios';
import type {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

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

// Define a type for the custom header generator function
type CustomHeadersGenerator = () => Record<string, string>;

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
async function createApiClient(
  customHeadersGenerator?: CustomHeadersGenerator,
): Promise<AxiosInstance> {
  const accessToken = await getValidToken();

  const client = axios.create({
    baseURL: EXTERNAL_SERVICE_URL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  // Add request interceptor to ensure token is always valid
  client.interceptors.request.use(async (config) => {
    const token = await getValidToken();
    config.headers['Authorization'] = `Bearer ${token}`;

    // Add custom headers if a generator function is provided
    if (customHeadersGenerator) {
      const customHeaders = customHeadersGenerator();
      Object.assign(config.headers, customHeaders);
    }

    return config;
  });

  // Add response interceptor for token refresh and request retry
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };
      if (
        error.response &&
        error.response.status === 401 &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;
        try {
          // Token might be expired, get a new one
          const newToken = await getNewToken();
          // Update the token in the original request
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          // Retry the original request with the new token
          return axios(originalRequest);
        } catch (refreshError) {
          // If token refresh fails, reject with the original error
          return Promise.reject(error);
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
