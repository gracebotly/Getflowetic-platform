import { json } from '@remix-run/cloudflare';
import { withSecurity } from '~/lib/security';

export const loader = withSecurity(async () => {
  return json(
    {
      error: true,
      message: 'This endpoint has been disabled for security reasons. No secrets are returned.',
      hint: 'Use /api/check-env-key?provider=<name> to check presence (boolean only).',
    },
    { status: 410 },
  );
}, {
  allowedMethods: ['GET'],
  rateLimit: true,
});
