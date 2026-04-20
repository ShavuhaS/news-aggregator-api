import { Request } from 'express';

export const cookieExtractor = (cookieName: string) => {
  return (req: Request): string | null => {
    if (req && req.cookies) {
      return req.cookies[cookieName] || null;
    }
    return null;
  };
};
