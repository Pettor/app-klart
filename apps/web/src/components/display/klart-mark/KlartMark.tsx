import type { ReactElement } from "react";
import { useIntl } from "react-intl";

export interface KlartMarkProps {
  /** Rendered width and height in px. */
  size?: number;
  /** Adds a hairline border so the white tile stands out on light backgrounds. */
  outlined?: boolean;
  /** When set, the mark is announced to screen readers; otherwise it's decorative. */
  labelled?: boolean;
  className?: string;
}

/**
 * The Klart app mark: an open day ring the check breaks out of. Stroke widths
 * thicken at small sizes so the mark stays legible as a favicon.
 */
export function KlartMark({ size = 28, outlined = false, labelled = false, className }: KlartMarkProps): ReactElement {
  const intl = useIntl();
  const ring = size >= 96 ? 9 : size >= 48 ? 11 : 13;
  const stroke = size >= 96 ? 12 : size >= 48 ? 15 : 17;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      {...(labelled
        ? {
            role: "img",
            "aria-label": intl.formatMessage({
              description: "KlartMark - accessible name of the app logo",
              defaultMessage: "Klart",
              id: "/+hs7f",
            }),
          }
        : { "aria-hidden": true })}
    >
      <rect
        x="2"
        y="2"
        width="96"
        height="96"
        rx="22"
        fill="#ffffff"
        stroke={outlined ? "#dfe2e6" : "none"}
        strokeWidth="3"
      />
      <circle
        cx="50"
        cy="52"
        r="30"
        fill="none"
        stroke={size >= 48 ? "#a6e9d5" : "#7fdcc0"}
        strokeWidth={ring}
        strokeLinecap="round"
        strokeDasharray="150 39"
        transform="rotate(-20 50 52)"
      />
      <path d="M35 53 L46 64" stroke="#0b7285" strokeWidth={stroke} strokeLinecap="round" fill="none" />
      <path d="M46 64 L74 32" stroke="#12b886" strokeWidth={stroke} strokeLinecap="round" fill="none" />
    </svg>
  );
}
