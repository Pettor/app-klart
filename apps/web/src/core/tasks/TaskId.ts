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
