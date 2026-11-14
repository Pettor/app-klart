const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/**
 * Creates a ULID: 10 characters of millisecond timestamp followed by 16
 * random characters, Crockford base32. Ids sort by creation time.
 */
export function createTaskId(now: number = Date.now()): string {
  let time = "";
  let remaining = now;
  for (let i = 0; i < 10; i += 1) {
    time = CROCKFORD[remaining % 32] + time;
    remaining = Math.floor(remaining / 32);
  }

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let random = "";
  for (const byte of bytes) {
    random += CROCKFORD[byte % 32];
  }

  return time + random;
}

/**
 * A ULID whose random part comes from `seed`, so two devices deriving the same task (the next occurrence of a
 * recurring one) pick the same id and sync merges them instead of keeping both.
 */
export function createDerivedTaskId(seed: string, time: number): string {
  const id = createTaskId(time);
  // FNV-1a, run once per character so every position depends on the whole seed.
  let hash = 0x811c9dc5;
  let random = "";
  for (let i = 0; i < 16; i += 1) {
    for (const char of `${i}:${seed}`) {
      hash = Math.imul(hash ^ char.charCodeAt(0), 0x01000193) >>> 0;
    }
    random += CROCKFORD[hash % 32];
  }
  return id.slice(0, 10) + random;
}
