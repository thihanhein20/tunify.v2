const REQUEST_TIMEOUT_MS = 15_000;

// Includes reading the response body, not just receiving its headers.
export async function requestJson<T>(url: string, options: RequestInit = {}): Promise<{ response: Response; data: T }> {
  const controller = new AbortController();
  const cancel = () => controller.abort(options.signal?.reason);
  options.signal?.addEventListener("abort", cancel, { once: true });
  if (options.signal?.aborted) cancel();
  const timer = setTimeout(() => controller.abort(new Error("Spotify took too long to respond. Please try again.")), REQUEST_TIMEOUT_MS);
  let onAbort: () => void = () => {};
  const aborted = new Promise<never>((_, reject) => {
    onAbort = () => reject(controller.signal.reason);
    controller.signal.addEventListener("abort", onAbort, { once: true });
    if (controller.signal.aborted) onAbort();
  });
  try {
    return await Promise.race([
      aborted,
      (async () => {
        controller.signal.throwIfAborted();
        const response = await fetch(url, { ...options, signal: controller.signal });
        const data = await response.json().catch(() => {
          if (response.ok) throw new Error("Spotify returned an unreadable response. Please try again.");
          return null;
        });
        return { response, data: data as T };
      })(),
    ]);
  } catch (error) {
    if (controller.signal.aborted) throw controller.signal.reason;
    if (error instanceof TypeError) throw new Error("Couldn’t reach Spotify. Check your internet connection and try again.");
    throw error;
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", cancel);
    controller.signal.removeEventListener("abort", onAbort);
  }
}

export function retryDeadline(value: string | null) {
  if (value !== null && value.trim() !== "") {
    const seconds = Number(value);
    if (Number.isFinite(seconds) && seconds >= 0) return Date.now() + seconds * 1000;
    const date = Date.parse(value);
    if (Number.isFinite(date)) return Math.max(Date.now(), date);
  }
  return Date.now() + 30_000;
}
