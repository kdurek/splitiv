import { generateCodeVerifier, generateState } from 'arctic';
import { cookies } from 'next/headers';

import { google } from '@/server/auth';

export async function GET(): Promise<Response> {
  console.log('🚀 > _____START_AUTH_____:');
  console.log('🚀 > _____GENERATED_____:');
  const state = generateState();
  console.log('🚀 > state:', state);
  const codeVerifier = generateCodeVerifier();
  console.log('🚀 > codeVerifier:', codeVerifier);

  const url = await google.createAuthorizationURL(state, codeVerifier, {
    scopes: ['profile', 'email'],
  });
  console.log('🚀 > url:', url);

  cookies().set('google_oauth_state', state, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  });

  cookies().set('google_oauth_code_verifier', codeVerifier, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  });

  console.log('🚀 > _____STORED_____:');
  const storedState = cookies().get('google_oauth_state')?.value ?? null;
  console.log('🚀 > storedState:', storedState);
  const storedCodeVerifier = cookies().get('google_oauth_code_verifier')?.value ?? null;
  console.log('🚀 > storedCodeVerifier:', storedCodeVerifier);
  console.log('🚀 > _____END_AUTH_____:');

  return Response.redirect(url);
}
