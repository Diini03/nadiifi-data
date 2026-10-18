import { supabase } from "@/integrations/supabase/client";

const keyCache = new Map<string, CryptoKey>();

function bytesToB64(bytes: Uint8Array): string {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

function b64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function getKey(userId: string, create = true): Promise<CryptoKey> {
  const cached = keyCache.get(userId);
  if (cached) return cached;

  const { data, error: readError } = await supabase
    .from("user_dataset_keys")
    .select("key")
    .eq("user_id", userId)
    .maybeSingle();
  if (readError) throw readError;

  let raw: Uint8Array<ArrayBuffer>;
  if (data?.key) {
    raw = b64ToBytes(data.key);
  } else {
    if (!create) throw new Error("Your dataset encryption key is unavailable.");
    raw = crypto.getRandomValues(new Uint8Array(32));
    const { error } = await supabase
      .from("user_dataset_keys")
      .upsert({ user_id: userId, key: bytesToB64(raw) }, { onConflict: "user_id", ignoreDuplicates: true });
    if (error) throw error;
    // Read the winning key: simultaneous saves must never replace one another's key.
    const { data: saved, error: savedError } = await supabase
      .from("user_dataset_keys")
      .select("key")
      .eq("user_id", userId)
      .single();
    if (savedError) throw savedError;
    if (!saved?.key) throw new Error("Couldn't retrieve your dataset encryption key.");
    raw = b64ToBytes(saved.key);
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
  if (!ivB64 || !ctB64) throw new Error("The encrypted dataset is incomplete.");
  const key = await getKey(userId, false);
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64ToBytes(ivB64) },
    key,
    b64ToBytes(ctB64),
  );
  return JSON.parse(new TextDecoder().decode(pt));
}
