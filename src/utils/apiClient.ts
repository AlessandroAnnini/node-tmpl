import axios from 'axios';
import type {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

// Environment variable retrieval with default values
const AUTH_URL =
  process.env['AUTH_URL'] || 'https://workspace-auth.example.com/oauth/token';
const EXTERNAL_SERVICE_URL =
  process.env['EXTERNAL_SERVICE_URL'] ||
  'https://workspace-api.example.com/api/v1';
const CLIENT_ID = process.env['CLIENT_ID'];
const CLIENT_SECRET = process.env['CLIENT_SECRET'];
const GRANT_TYPE = process.env['GRANT_TYPE']; // M2M authentication grant type

// Validate required environment variables
if (
  !AUTH_URL ||
  !EXTERNAL_SERVICE_URL ||
  !CLIENT_ID ||
  !CLIENT_SECRET ||
  !GRANT_TYPE
) {
  throw new Error('Missing required environment variables');
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

let token: string | null = null;
let tokenExpiry: number | null = null;

// Type definition for custom header generator function
type CustomHeadersGenerator = () => Record<string, string>;

/**
 * Fetches a new access token from the authentication server.
 * Uses URL-encoded data as required by 'application/x-www-form-urlencoded' content type.
 */
async function getNewToken(): Promise<string> {
  try {
    const params = new URLSearchParams();
    params.append('client_id', CLIENT_ID!);
    params.append('client_secret', CLIENT_SECRET!);
    params.append('grant_type', GRANT_TYPE!);

    const response = await axios.post<TokenResponse>(
      AUTH_URL,
      params.toString(),
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
      'Error obtaining new token:',
      error instanceof Error ? error.message : 'Unknown error occurred',
    );
    throw error;
  }
}

/**
 * Retrieves a valid access token.
 * Renews the token if it's expired or about to expire within a 60-second window.
 */
async function getValidToken(): Promise<string> {
  const TOKEN_EXPIRY_BUFFER = 60 * 1000; // 60 seconds buffer

  if (
    !token ||
    !tokenExpiry ||
    Date.now() >= tokenExpiry - TOKEN_EXPIRY_BUFFER
  ) {
    return await getNewToken();
  }
  return token;
}

/**
 * Creates an Axios client instance configured with authentication and custom headers.
 * Includes interceptors for automatic token renewal and request retrying.
 */
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

  // Request interceptor to ensure the token is always valid
  client.interceptors.request.use(async (config) => {
    const validToken = await getValidToken();
    config.headers['Authorization'] = `Bearer ${validToken}`;

    // Add custom headers if a generator function is provided
    if (customHeadersGenerator) {
      const customHeaders = customHeadersGenerator();
      Object.assign(config.headers, customHeaders);
    }

    return config;
  });

  // Response interceptor for token refresh and request retry
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Ensure originalRequest exists and hasn't been retried yet
      if (
        error.response &&
        error.response.status === 401 &&
        originalRequest &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;
        try {
          // Token might be expired, get a new one
          const newToken = await getNewToken();
          // Update the token in the original request
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          // Retry the original request with the new token using the same client instance
          return client.request(originalRequest);
        } catch (refreshError) {
          // If token refresh fails, reject with the original error
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    },
  );

  return client;
}

export { createApiClient };

// Example usage of the client to call Workspace APIs
// Uncomment the following code to test the API client

/*
async function fetchWorkspaces() {
  try {
    const apiClient = await createApiClient();
    const response = await apiClient.get('/workspaces');
    console.log('Workspace data:', response.data);
    return response.data;
  } catch (error) {
    console.error(
      'Error fetching data:',
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
    throw error;
  }
}

// Execute the example data fetch
fetchWorkspaces().catch((error) => {
  console.error('Failed to fetch workspaces:', error);
});
*/
