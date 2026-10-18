 # Architecture

- Encrypt and decrypt saved dataset payloads in the browser; upgrade legacy plaintext on authenticated load with an optimistic timestamp guard so newer edits are not overwritten.
- Create encryption keys with insert-if-absent and read back the winning key; never replace a key during concurrent saves or create a replacement while decrypting, because existing ciphertext depends on that key.