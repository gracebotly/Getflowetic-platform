import { json } from '@remix-run/cloudflare';
import { withSecurity } from '~/lib/security';
import {
  getProviderMasked,
  setProviderKey,
  deleteProviderKey,
} from '~/lib/byok/secure-store.server';

async function loaderImpl({ request, context }: { request: Request; context: any }) {
  const url = new URL(request.url);
  const provider = url.searchParams.get('provider');
  if (!provider) {
    return json({ error: 'provider is required' }, { status: 400 });
  }
  const env = (context as any)?.cloudflare?.env as Record<string, unknown> | undefined;
  const res = await getProviderMasked(request, env, provider);
  return json(res, { status: 200 });
}

async function actionImpl({ request, context }: { request: Request; context: any }) {
  const method = request.method.toUpperCase();
  const env = (context as any)?.cloudflare?.env as Record<string, unknown> | undefined;

  if (method === 'POST') {
    const body = await request.json().catch(() => null);
    const provider = body?.provider as string | undefined;
    const key = body?.key as string | undefined;
    if (!provider || !key) {
      return json({ error: 'provider and key are required' }, { status: 400 });
    }
    const { headers, masked } = await setProviderKey(request, env, provider, key);
    return new Response(JSON.stringify({ ok: true, isSet: true, masked }), {
      status: 200,
      headers: { ...Object.fromEntries(headers), 'Content-Type': 'application/json' },
    });
  }

  if (method === 'DELETE') {
    const url = new URL(request.url);
    const provider = url.searchParams.get('provider');
    if (!provider) {
      return json({ error: 'provider is required' }, { status: 400 });
    }
    const { headers } = await deleteProviderKey(request, provider);
    return new Response(JSON.stringify({ ok: true, isSet: false }), {
      status: 200,
      headers: { ...Object.fromEntries(headers), 'Content-Type': 'application/json' },
    });
  }

  return json({ error: 'Method not allowed' }, { status: 405 });
}

export const loader = withSecurity(loaderImpl, {
  allowedMethods: ['GET'],
  rateLimit: true,
});

export const action = withSecurity(actionImpl, {
  allowedMethods: ['POST', 'DELETE'],
  rateLimit: true,
});
