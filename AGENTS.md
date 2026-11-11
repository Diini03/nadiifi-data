 # Architecture

- Encrypt and decrypt saved dataset payloads in the browser; upgrade legacy plaintext on authenticated load with an optimistic timestamp guard so newer edits are not overwritten.
- Create encryption keys with insert-if-absent and read back the winning key; never replace a key during concurrent saves or create a replacement while decrypting, because existing ciphertext depends on that key.
- Route dataset mutations through browser operation previews and approved audit records; keep undo snapshots so users can recover exact rows.
- Serialize encrypted cloud writes through the shared save queue and persist active workflow drafts in IndexedDB, so navigation and rapid edits retain current work.
- Apply user semantic roles before analytic calculations; use UTC calendar buckets, nonnegative additive shares, and explicit included/excluded counts.
- Run focused regressions with `bun run test`; browser interaction checks cover workflow integration.
- Store cleaning recipes in owner-separated browser IndexedDB; replay only selected non-destructive approved rules through the shared preview/audit/undo path, recalculating statistical fills for the destination file so old estimates and row indices never carry over.
