import { createRemoteJWKSet, jwtVerify } from 'jose';
import { Context, Next } from 'hono';
import type { CloudflareBindings } from '../types';

// Cache for JWKS to avoid repeated fetches
const jwksCache = new Map<string, any>();

export async function jwtAuth(c: Context<{ Bindings: CloudflareBindings; Variables: { user: any } }>, next: Next) {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Missing or invalid Authorization header' }, 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const { AUTH0_DOMAIN, AUTH0_AUDIENCE } = c.env;
    
    if (!AUTH0_DOMAIN || !AUTH0_AUDIENCE) {
      console.error('Missing Auth0 configuration: AUTH0_DOMAIN or AUTH0_AUDIENCE');
      return c.json({ error: 'Server configuration error' }, 500);
    }

    // Get or create JWKS
    const jwksUrl = `https://${AUTH0_DOMAIN}/.well-known/jwks.json`;
    let JWKS = jwksCache.get(jwksUrl);
    
    if (!JWKS) {
      JWKS = createRemoteJWKSet(new URL(jwksUrl));
      jwksCache.set(jwksUrl, JWKS);
    }

    // Verify the JWT
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://${AUTH0_DOMAIN}/`,
      audience: AUTH0_AUDIENCE,
    });

    // Validate that the token is for our specific audience
    if (!payload.aud || (Array.isArray(payload.aud) ? !payload.aud.includes(AUTH0_AUDIENCE) : payload.aud !== AUTH0_AUDIENCE)) {
      return c.json({ error: 'Invalid token audience' }, 403);
    }

    // Add user info to context for potential use in routes
    c.set('user', payload);
    
    await next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    
    // Provide more specific error messages for debugging
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        return c.json({ error: 'Token expired' }, 401);
      }
      if (error.message.includes('signature')) {
        return c.json({ error: 'Invalid token signature' }, 401);
      }
    }
    
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
} 