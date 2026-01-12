
interface FetchOptions extends RequestInit {
  timeout?: number;
}

function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export async function fetchHandler<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    timeout = 10000,
    headers: customHeaders = {},
    ...restOptions
  } = options;

  // AbortController is built into the DOM allowing us to abort a request
  // We can then set a timeout to automatically abort a request if it takes too long
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  //   Getting the headers
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  // If body is FormData, let the browser set Content-Type with boundary
  if (options.body instanceof FormData) {
    delete defaultHeaders['Content-Type'];
  }

  const headers: HeadersInit = { ...defaultHeaders, ...customHeaders };

  const config: RequestInit = {
    ...restOptions,
    headers,
    signal: controller.signal, // This is the signal to support request cancellation
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(id);

    if (!response.ok) {
      let body;
      try {
        body = await response.json();
      } catch {}
      console.log(
        'This is the body when the response was not ok',
        body,
        response.status
      );
      switch (response.status) {
        case 404:
          throw new Error('Not Found');
        case 422:
          throw new Error(body.errors);
        default:
          throw new Error(`HTTP Error: ${response.status}`);
      }
    }
    return await response.json();
  } catch (err) {
    clearTimeout(id);
    const error = isError(err) ? err : new Error('Unknown Error');
    if (error.name === 'AbortError') {
      console.error(`Request to ${url} timed out`);
    } else {
      console.error(`Error fetching ${url}: ${error.message}`);
    }

    return Promise.reject(error);
  }
}
