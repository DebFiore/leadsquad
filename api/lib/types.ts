// api/lib/types.ts
// Inline types to avoid @vercel/node dependency issues during build

export interface VercelRequest {
  method?: string;
  url?: string;
  headers: { [key: string]: string | string[] | undefined };
  query: { [key: string]: string | string[] };
  cookies: { [key: string]: string };
  body: any;
  [Symbol.asyncIterator](): AsyncIterableIterator<Buffer>;
}

export interface VercelResponse {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => VercelResponse;
  send: (data: any) => VercelResponse;
  end: (data?: any) => VercelResponse;
  setHeader: (name: string, value: string | string[]) => VercelResponse;
}
