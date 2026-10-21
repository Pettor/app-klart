export type SettingsSection = "account" | "appearance" | "about";

/** Sections of the settings page, in display order. */
export const SETTINGS_SECTION_IDS = ["appearance", "contexts", "notifications", "sync", "agents", "about"] as const;

export type SettingsSectionId = (typeof SETTINGS_SECTION_IDS)[number];
