const ACCESS_TOKEN_KEY = 'auth_access_token';

export async function getAuthHeaders(extraHeaders?: HeadersInit): Promise<Headers> {
  const headers = new Headers(extraHeaders);

  if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (storedToken) {
      headers.set('Authorization', `Bearer ${storedToken}`);
    }
  }

  return headers;
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  return fetch(input, {
    ...init,
    headers: await getAuthHeaders(init.headers),
  });
}
