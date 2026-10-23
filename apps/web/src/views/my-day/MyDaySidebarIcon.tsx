import type { ReactElement } from "react";

export interface MyDaySidebarIconProps {
  /** `collapse` points the chevron left, `expand` right. */
  direction: "collapse" | "expand";
  className?: string;
}

/** A window with a sidebar and a chevron, from the design. Heroicons has no sidebar icon. */
export function MyDaySidebarIcon({ direction, className }: MyDaySidebarIconProps): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d={direction === "collapse" ? "M9 4v16M16 10l-2 2 2 2" : "M9 4v16M14 10l2 2-2 2"} />
    </svg>
  );
}
