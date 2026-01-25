// api/lib/webhookUtils.ts
import crypto from 'crypto';

/**
 * Verify Retell webhook signature
 */
export function verifyRetellSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * Verify Vapi webhook signature
 */
export function verifyVapiSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(`sha256=${expectedSignature}`)
    );
  } catch {
    return false;
  }
}

/**
 * Verify N8N webhook token
 */
export function verifyN8NToken(
  providedToken: string,
  expectedToken: string
): boolean {
  if (!providedToken || !expectedToken) return false;
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(providedToken),
      Buffer.from(expectedToken)
    );
  } catch {
    return false;
  }
}

/**
 * Parse duration string to seconds
 */
export function parseDuration(duration: string | number): number {
  if (typeof duration === 'number') return Math.round(duration);
  
  // Handle "MM:SS" format
  if (duration.includes(':')) {
    const [mins, secs] = duration.split(':').map(Number);
    return (mins * 60) + secs;
  }
  
  return Math.round(parseFloat(duration));
}

/**
 * Extract organization ID from agent/assistant metadata
 */
export function extractOrganizationId(metadata: Record<string, any>): string | null {
  return metadata?.organization_id || 
         metadata?.organizationId || 
         metadata?.org_id ||
         null;
}
