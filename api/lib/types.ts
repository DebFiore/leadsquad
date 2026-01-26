// api/lib/types.ts
// Inline types to avoid @vercel/node dependency issues during build

import type { IncomingMessage, ServerResponse } from 'http';

export interface VercelRequest extends IncomingMessage {
  query: { [key: string]: string | string[] };
  cookies: { [key: string]: string };
  body: any;
}

export interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
  send: (data: any) => void;
  end: (data?: any) => VercelResponse;
  setHeader: (name: string, value: string | string[]) => VercelResponse;
}
