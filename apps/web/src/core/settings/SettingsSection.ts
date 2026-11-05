export type SettingsSection = "account" | "appearance" | "about";

/** Sections of the settings page, in display order. */
export const SETTINGS_SECTION_IDS = [
  "general",
  "appearance",
  "contexts",
  "sync",
  "notifications",
  "suggestions",
  "automations",
  "agents",
  "about",
] as const;

export type SettingsSectionId = (typeof SETTINGS_SECTION_IDS)[number];
