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

/** Keeps valid, distinct links in order. Task files are written by people and agents, so anything else is dropped. */
export function toTaskLinks(values: readonly string[]): string[] {
  const links: string[] = [];
  for (const value of values) {
    const link = value.trim();
    if (isTaskLink(link) && !links.includes(link)) {
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
