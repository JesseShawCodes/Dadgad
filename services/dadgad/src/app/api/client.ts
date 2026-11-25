import { apiBaseUrl } from '../services/envConfig';
import type {
  ApiErrorBody,
  ArtistPagePayload,
  SelectMatchupWinnerRequest,
} from './types';

export class ApiClientError extends Error {
  status: number;
  body: ApiErrorBody | null;

  constructor(message: string, status: number, body: ApiErrorBody | null = null) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  credentials?: RequestCredentials;
  signal?: AbortSignal;
};

async function parseJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Typed fetch wrapper for Django API calls.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, credentials = 'include', signal } = options;
  const url = path.startsWith('http') ? path : `${apiBaseUrl}${path}`;

  const response = await fetch(url, {
    method,
    credentials,
    signal,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    const errorBody = (data && typeof data === 'object' ? data : null) as ApiErrorBody | null;
    const message =
      errorBody?.error ||
      errorBody?.message ||
      `Request failed with status ${response.status}`;
    throw new ApiClientError(message, response.status, errorBody);
  }

  return data as T;
}

export function fetchArtistBracket(artistName: string): Promise<ArtistPagePayload> {
  return apiRequest<ArtistPagePayload>(
    `/api/brackets/artist/${encodeURIComponent(artistName)}`,
  );
}

export function fetchBracketDetail(bracketId: number | string): Promise<unknown> {
  return apiRequest(`/api/brackets/${bracketId}/`);
}

export type SelectMatchupWinnerPayload = SelectMatchupWinnerRequest & {
  bracket_id?: number | string;
};

export function selectMatchupWinnerRequest(
  payload: SelectMatchupWinnerPayload,
): Promise<{ message?: string; bracket_id?: number; bracket?: unknown }> {
  return apiRequest(`/api/brackets/select-matchup-winner/`, {
    method: 'POST',
    body: payload,
  });
}
