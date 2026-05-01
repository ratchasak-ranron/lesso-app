import { createApiClient } from '@lesso/api-client';

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/v1';

export const apiClient = createApiClient('mock', { baseUrl });
