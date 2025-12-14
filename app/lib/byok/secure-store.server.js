import { createCookie } from '@remix-run/node';
const BYOK_COOKIE_NAME = 'byok_v1';
const byokCookie = createCookie(BYOK_COOKIE_NAME, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    // Optional: 180 days; adjust as needed
    maxAge: 60 * 60 * 24 * 180,
});
/**
 * AES-GCM encrypt/decrypt helpers using a 32-byte key derived from BYOK_ENCRYPTION_KEY.
 */
async function getAesKey(secret) {
    const enc = new TextEncoder();
    const keyBytes = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(secret)));
    return crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt', 'decrypt']);
}
function toBase64(bytes) {
    let bin = '';
    for (let i = 0; i < bytes.length; i++)
        bin += String.fromCharCode(bytes[i]);
    // btoa is available in Cloudflare; in Node, globalThis.btoa may not exist. Use Buffer fallback.
    if (typeof btoa === 'function')
        return btoa(bin);
    // @ts-ignore
    return Buffer.from(bytes).toString('base64');
}
function fromBase64(b64) {
    let bin;
    if (typeof atob === 'function') {
        bin = atob(b64);
    }
    else {
        // @ts-ignore
        bin = Buffer.from(b64, 'base64').toString('binary');
    }
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++)
        out[i] = bin.charCodeAt(i);
    return out;
}
async function encrypt(secret, plaintext) {
    const key = await getAesKey(secret);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext)));
    const combined = new Uint8Array(iv.length + ciphertext.length);
    combined.set(iv, 0);
    combined.set(ciphertext, iv.length);
    return toBase64(combined);
}
async function decrypt(secret, payloadB64) {
    const key = await getAesKey(secret);
    const combined = fromBase64(payloadB64);
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
    return new TextDecoder().decode(plainBuf);
}
function requireEncryptionKey(env) {
    const key = (env?.BYOK_ENCRYPTION_KEY ?? process.env.BYOK_ENCRYPTION_KEY) || '';
    if (!key || key.length < 16) {
        throw new Error('Missing BYOK_ENCRYPTION_KEY (>=16 chars) in environment. Set it to a strong random value.');
    }
    return key;
}
export function maskKey(raw) {
    if (!raw)
        return '';
    const last4 = raw.slice(-4);
    return `**** **** **** ${last4}`;
}
export async function readByokStore(request) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader)
        return {};
    const parsed = await byokCookie.parse(cookieHeader);
    if (!parsed)
        return {};
    try {
        // Store is a plain JSON object of provider -> encrypted(base64)
        if (typeof parsed === 'string') {
            // Backward safety: stringified JSON
            return JSON.parse(parsed);
        }
        return parsed;
    }
    catch {
        return {};
    }
}
export async function getProviderMasked(request, env, provider) {
    const store = await readByokStore(request);
    const encrypted = store[provider];
    if (!encrypted)
        return { isSet: false };
    try {
        const key = requireEncryptionKey(env);
        const decrypted = await decrypt(key, encrypted);
        return { isSet: true, masked: maskKey(decrypted) };
    }
    catch {
        // Corrupted or invalid secret -> treat as not set
        return { isSet: false };
    }
}
export async function setProviderKey(request, env, provider, rawKey) {
    const key = requireEncryptionKey(env);
    const encrypted = await encrypt(key, rawKey);
    const store = await readByokStore(request);
    store[provider] = encrypted;
    const headers = new Headers();
    headers.append('Set-Cookie', await byokCookie.serialize(store));
    return { headers, masked: maskKey(rawKey) };
}
export async function deleteProviderKey(request, provider) {
    const store = await readByokStore(request);
    delete store[provider];
    const headers = new Headers();
    // If empty, clear cookie
    if (Object.keys(store).length === 0) {
        headers.append('Set-Cookie', await byokCookie.serialize('', { maxAge: 0 }));
    }
    else {
        headers.append('Set-Cookie', await byokCookie.serialize(store));
    }
    return { headers };
}
