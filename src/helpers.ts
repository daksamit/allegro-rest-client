import { AuthResponse } from './types';

export const getExpiredIn = (tokens: AuthResponse): number => {
  const now = +new Date();
  if (!tokens || !tokens.created_at) return 0;
  const expiration = new Date((tokens.expires_in + tokens.created_at) * 1000);
  const expHours = (+expiration - +now) / 1000 / 60 / 60;
  return expHours;
};
