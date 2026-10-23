/**
 * Whether animations run from script should be skipped: Settings › Appearance › Motion is Reduced, or it follows
 * the system and the system asks for less motion. CSS reads the same `data-motion` attribute.
 */
export function isMotionReduced(): boolean {
  const motion = document.documentElement.dataset.motion;
  if (motion === "reduced") {
    return true;
  }
  return motion !== "full" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
