export async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(15000) });
  if (!response.ok) {
    throw new Error(response.status === 429
      ? "Too many requests. Wait a moment and try again."
      : "The game couldn't connect. Please try again.");
  }
  return response.json() as Promise<T>;
}
