import { beforeEach, expect, mock, test } from "bun:test";

const keys = new Map();
let readFailure = false;
mock.module("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: (_column, id) => {
          const read = async () => ({
            data: keys.has(id) ? { key: keys.get(id) } : null,
            error: readFailure ? new Error("Key read failed") : null,
          });
          return { maybeSingle: read, single: read };
        },
      }),
      upsert: async (row, options) => {
        if (!options.ignoreDuplicates || !keys.has(row.user_id)) keys.set(row.user_id, row.key);
        return { error: null };
      },
    }),
  },
}));

const { encryptPayload, decryptPayload } = await import("./crypto");
beforeEach(() => { keys.clear(); readFailure = false; });

test("encrypted rows unlock without changing their values", async () => {
  const rows = [{ Name: "Private test", Amount: 123.45, Missing: null }];
  const encrypted = await encryptPayload("round-trip", rows);
  expect(encrypted.startsWith("enc:v1:")).toBe(true);
  expect(encrypted.includes("Private test")).toBe(false);
  expect(await decryptPayload("round-trip", encrypted)).toEqual(rows);
});

test("concurrent first saves share one key and both unlock", async () => {
  const [first, second] = await Promise.all([
    encryptPayload("concurrent", [{ Amount: 10 }]),
    encryptPayload("concurrent", [{ Amount: 20 }]),
  ]);
  expect(keys.size).toBe(1);
  expect(await decryptPayload("concurrent", first)).toEqual([{ Amount: 10 }]);
  expect(await decryptPayload("concurrent", second)).toEqual([{ Amount: 20 }]);
});

test("decrypting with a missing key never creates a replacement", async () => {
  await expect(decryptPayload("missing", "enc:v1:AAAA:AAAA")).rejects.toThrow("unavailable");
  expect(keys.size).toBe(0);
});

test("key read errors cannot trigger key creation", async () => {
  readFailure = true;
  await expect(encryptPayload("read-error", [])).rejects.toThrow("Key read failed");
  expect(keys.size).toBe(0);
});