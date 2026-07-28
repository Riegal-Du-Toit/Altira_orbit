import { supabase } from '@/lib/supabase';

const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

export async function getAuthHeaders(extraHeaders?: HeadersInit): Promise<Headers> {
  const headers = new Headers(extraHeaders);

  if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    const {
      data: { session: existingSession },
    } = await supabase.auth.getSession();

    if (existingSession?.access_token) {
      headers.set('Authorization', `Bearer ${existingSession.access_token}`);
      localStorage.setItem(ACCESS_TOKEN_KEY, existingSession.access_token);
      if (existingSession.refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, existingSession.refresh_token);
      }
      return headers;
    }

    if (storedToken && storedRefreshToken) {
      const { data, error } = await supabase.auth.setSession({
        access_token: storedToken,
        refresh_token: storedRefreshToken,
      });

      if (!error && data.session?.access_token) {
        headers.set('Authorization', `Bearer ${data.session.access_token}`);
        localStorage.setItem(ACCESS_TOKEN_KEY, data.session.access_token);
        if (data.session.refresh_token) {
          localStorage.setItem(REFRESH_TOKEN_KEY, data.session.refresh_token);
        }
        return headers;
      }
    }

    if (storedToken) {
      headers.set('Authorization', `Bearer ${storedToken}`);
      return headers;
    }
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  return headers;
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  return fetch(input, {
    ...init,
    headers: await getAuthHeaders(init.headers),
  });
}
