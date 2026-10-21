/** True for an absolute `http(s)://` URL, the only kind of link a task may carry. */
export function isTaskLink(value: string): boolean {
  if (!/^https?:\/\//i.test(value)) {
    return false;
  }
  try {
    return !!new URL(value).hostname;
  } catch {
    return false;
  }
}

/**
 * Reads typed text as a link: an `http(s)://` URL as is, or a bare `www.` address with `https://` added
 * (`www.fz.se` → `https://www.fz.se`). Anything else is `null`.
 */
export function toTaskLink(value: string): string | null {
  if (isTaskLink(value)) {
    return value;
  }
  if (/^www\.[^.\s]+\.[^\s]+$/i.test(value) && isTaskLink(`https://${value}`)) {
    return `https://${value}`;
  }
  return null;
}

/**
 * Keeps valid, distinct links in order, adding `https://` to `www.` addresses. Task files are written by people
 * and agents, so anything else is dropped.
 */
export function toTaskLinks(values: readonly string[]): string[] {
  const links: string[] = [];
  for (const value of values) {
    const link = toTaskLink(value.trim());
    if (link && !links.includes(link)) {
      links.push(link);
    }
  }
  return links;
}

/** Short label for a link: its host without `www.`, e.g. `github.com`. */
export function formatTaskLink(link: string): string {
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return link;
  }
}
