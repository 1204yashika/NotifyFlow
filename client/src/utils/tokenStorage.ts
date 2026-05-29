const ACCESS_TOKEN_KEY  = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

const ls = () => (typeof localStorage !== 'undefined' ? localStorage : null);

export const tokenStorage = {
  getAccess:     () => ls()?.getItem(ACCESS_TOKEN_KEY) ?? null,
  setAccess:     (token: string) => { if (token) ls()?.setItem(ACCESS_TOKEN_KEY, token); },
  getRefresh:    () => ls()?.getItem(REFRESH_TOKEN_KEY) ?? null,
  setRefresh:    (token: string) => { if (token) ls()?.setItem(REFRESH_TOKEN_KEY, token); },
  clearTokens:   () => {
    ls()?.removeItem(ACCESS_TOKEN_KEY);
    ls()?.removeItem(REFRESH_TOKEN_KEY);
  },
};