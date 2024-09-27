import { createApiClient } from '../../utils/apiClient';

const apiClient = await createApiClient();

/**
 * Fetch data without parameters.
 * GET /no-params
 */
export const fetchNoParams = async () => {
  const response = await apiClient.get('/no-params');
  return response.data;
};

/**
 * Fetch data with query parameters.
 * GET /query
 * @param query - Query parameters
 */
export const fetchWithQuery = async (query: Record<string, any>) => {
  const response = await apiClient.get('/query', { params: query });
  return response.data;
};

/**
 * Fetch data with path parameters.
 * GET /params/:id
 * @param id - Path parameter
 */
export const fetchWithParams = async (id: string) => {
  const response = await apiClient.get(`/params/${id}`);
  return response.data;
};

/**
 * Fetch data with body payload.
 * POST /body
 * @param body - Request payload
 */
export const fetchWithBody = async (body: Record<string, any>) => {
  const response = await apiClient.post('/body', body);
  return response.data;
};
