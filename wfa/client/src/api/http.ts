import type { z } from 'zod';

export class ApiError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}
type Params = Record<string, string | number | undefined>;

/** Typed GET: builds the query string, surfaces readable errors and validates the response shape. */
export async function get<S extends z.ZodTypeAny>(path: string, schema: S, params: Params = {}, signal?: AbortSignal): Promise<z.infer<S>> {
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') query.set(k, String(v));
  let res: Response;
  try { res = await fetch(`/api${path}?${query}`, { signal }); }
  catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new ApiError('Cannot reach the server. Make sure the API is running (npm run dev).', 0);
  }
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (body as { error?: { message?: string } } | null)?.error?.message;
    throw new ApiError(message ?? 'The API server is unavailable. Start it with "npm run dev".', res.status);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ApiError('The server returned an unexpected response.', 502);
  return parsed.data;
}
