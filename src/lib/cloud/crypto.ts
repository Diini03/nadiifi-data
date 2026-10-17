import { supabase } from "@/integrations/supabase/client";

const keyCache = new Map<string, CryptoKey>();

function bytesToB64(bytes: Uint8Array): string {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function getKey(userId: string): Promise<CryptoKey> {
  const cached = keyCache.get(userId);
  if (cached) return cached;

  const { data } = await supabase
    .from("user_dataset_keys")
    .select("key")
    .eq("user_id", userId)
    .maybeSingle();

  let raw: Uint8Array;
  if (data?.key) {
    raw = b64ToBytes(data.key);
  } else {
    raw = crypto.getRandomValues(new Uint8Array(32));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase
      .from("user_dataset_keys")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert({ user_id: userId, key: bytesToB64(raw) } as any, { onConflict: "user_id" });
    if (error) throw error;
  }

  const key = await crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
  keyCache.set(userId, key);
  return key;
}

/** Encrypt a dataset payload with the user's private key. Returns "enc:v1:<iv>:<ciphertext>". */
export async function encryptPayload(userId: string, obj: unknown): Promise<string> {
  const key = await getKey(userId);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(JSON.stringify(obj));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  return `enc:v1:${bytesToB64(iv)}:${bytesToB64(new Uint8Array(ct))}`;
}

/** Decrypt a stored payload. Legacy plaintext payloads are returned as-is. */
export async function decryptPayload(userId: string, stored: unknown): Promise<unknown> {
  if (typeof stored !== "string" || !stored.startsWith("enc:v1:")) return stored;
  const [, , ivB64, ctB64] = stored.split(":");
  const key = await getKey(userId);
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64ToBytes(ivB64) },
    key,
    b64ToBytes(ctB64),
  );
  return JSON.parse(new TextDecoder().decode(pt));
}
