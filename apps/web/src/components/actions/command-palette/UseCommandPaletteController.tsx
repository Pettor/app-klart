import { useMemo } from "react";
import {
  Cog6ToothIcon,
  ComputerDesktopIcon,
  LightBulbIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  RectangleStackIcon,
  SparklesIcon,
  SunIcon,
} from "@heroicons/react/20/solid";
import { useRouter } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useIntl } from "react-intl";
import type { Command } from "./Command";
import type { CommandPaletteProps } from "./CommandPalette";
import { useCommandPalette } from "./UseCommandPalette";
import { useCommandPaletteShortcut } from "./UseCommandPaletteShortcut";
import { useCommandShortcuts } from "./UseCommandShortcuts";
import { ALL_CONTEXTS } from "~/core/contexts/KlartContext";
import { useHierarchyNavigation } from "~/core/routes/UseHierarchyNavigation";
import {
  currentContextAtom,
  klartDataAtom,
  searchFocusRequestAtom,
  showSuggestionsAtom,
  smartViewAtom,
  tagFilterAtom,
} from "~/core/tasks/KlartAtoms";
import { themeModeAtom } from "~/core/theme/ThemeAtoms";
import type { ThemeMode } from "~/core/theme/ThemeMode";

/**
 * Builds the app's command list (navigation, contexts, theme), wires up the
 * Cmd/Ctrl+K shortcut and per-command shortcuts, and returns props ready to
 * spread onto `<CommandPalette>`. To add or change commands, extend the array
 * returned from `useMemo` below — `Command` is intentionally minimal.
 */
export function useCommandPaletteController(): CommandPaletteProps {
  const intl = useIntl();
  const router = useRouter();
  const navigation = useHierarchyNavigation();
  const setThemeMode = useSetAtom(themeModeAtom);
  const { isOpen, close } = useCommandPalette();
  const { contexts } = useAtomValue(klartDataAtom);
  const setCurrentContext = useSetAtom(currentContextAtom);
  const setTag = useSetAtom(tagFilterAtom);
  const setSmartView = useSetAtom(smartViewAtom);
  const setShowSuggestions = useSetAtom(showSuggestionsAtom);
  const requestSearchFocus = useSetAtom(searchFocusRequestAtom);

  const navigationGroup = intl.formatMessage({
    description: "CommandPaletteController: label - navigation group",
    defaultMessage: "Navigation",
    id: "RCtY7O",
  });
  const appearanceGroup = intl.formatMessage({
    description: "CommandPaletteController: label - appearance group",
    defaultMessage: "Appearance",
    id: "vWoN3+",
  });

  const contextsGroup = intl.formatMessage({
    description: "CommandPaletteController: label - contexts group",
    defaultMessage: "Contexts",
    id: "oBRfDH",
  });
  const allContextsName = intl.formatMessage({
    description: "CommandPaletteController: name of the all-contexts view",
    defaultMessage: "All contexts",
    id: "x9kOSw",
  });

  const commands = useMemo<Command[]>(() => {
    /** Leaves settings for My Day; on My Day itself it stays put, keeping any open task. */
    function goToMyDay(): void {
      if (router.state.location.pathname !== "/") {
        navigation.up({ to: "/" });
      }
    }

    function setTheme(mode: ThemeMode): void {
      setThemeMode(mode);
    }

    const contextCommands: Command[] = [{ id: ALL_CONTEXTS, name: allContextsName }, ...contexts].map(
      (context, index) => ({
        id: `context-${context.id}`,
        label: intl.formatMessage(
          {
            description: "CommandPaletteController: label - switch context command",
            defaultMessage: "Switch to {name}",
            id: "lc5YYJ",
          },
          { name: context.name }
        ),
        group: contextsGroup,
        keywords: ["context", context.name.toLowerCase()],
        icon: <RectangleStackIcon className="h-4 w-4" />,
        shortcut: index < 10 ? { alt: true, key: String(index) } : undefined,
        perform: () => {
          setCurrentContext(context.id);
          setTag(null);
          goToMyDay();
        },
      })
    );

    return [
      {
        id: "goto-home",
        label: intl.formatMessage({
          description: "CommandPaletteController: label - go to My Day command",
          defaultMessage: "Go to My Day",
          id: "IaFuu+",
        }),
        description: intl.formatMessage({
          description: "CommandPaletteController: caption - go to My Day command",
          defaultMessage: "Today's plan and suggestions",
          id: "FDzKcX",
        }),
        group: navigationGroup,
        keywords: ["home", "start", "today", "day"],
        icon: <SunIcon className="h-4 w-4" />,
        shortcut: { mod: true, shift: true, key: "h" },
        perform: () => {
          setSmartView("day");
          goToMyDay();
        },
      },
      {
        id: "search-tasks",
        label: intl.formatMessage({
          description: "CommandPaletteController: label - focus the task search command",
          defaultMessage: "Search tasks",
          id: "1umRZP",
        }),
        group: navigationGroup,
        keywords: ["search", "find", "filter", "tag"],
        icon: <MagnifyingGlassIcon className="h-4 w-4" />,
        shortcut: { key: "/" },
        perform: () => {
          goToMyDay();
          requestSearchFocus((current) => current + 1);
        },
      },
      {
        id: "goto-settings",
        label: intl.formatMessage({
          description: "CommandPaletteController: label - open settings command",
          defaultMessage: "Open settings",
          id: "QYh+hg",
        }),
        description: intl.formatMessage({
          description: "CommandPaletteController: caption - open settings command",
          defaultMessage: "Contexts, sync, notifications",
          id: "KysZ0J",
        }),
        group: navigationGroup,
        keywords: ["settings", "preferences", "sync", "folder", "notifications"],
        icon: <Cog6ToothIcon className="h-4 w-4" />,
        perform: () => {
          if (router.state.location.pathname !== "/settings") {
            navigation.down({ to: "/settings" });
          }
        },
      },
      {
        id: "toggle-suggestions",
        label: intl.formatMessage({
          description: "CommandPaletteController: label - toggle suggestions panel command",
          defaultMessage: "Toggle suggestions",
          id: "cT1sU4",
        }),
        group: navigationGroup,
        keywords: ["suggestions", "plan", "due"],
        icon: <LightBulbIcon className="h-4 w-4" />,
        perform: () => {
          setShowSuggestions((current) => !current);
          goToMyDay();
        },
      },
      ...contextCommands,
      {
        id: "theme-auto",
        label: intl.formatMessage({
          description: "CommandPaletteController: label - theme system command",
          defaultMessage: "Theme: System",
          id: "xr2NN2",
        }),
        group: appearanceGroup,
        keywords: ["auto", "system", "theme"],
        icon: <ComputerDesktopIcon className="h-4 w-4" />,
        perform: () => setTheme("auto"),
      },
      {
        id: "theme-light",
        label: intl.formatMessage({
          description: "CommandPaletteController: label - theme light command",
          defaultMessage: "Theme: Light",
          id: "MibXHq",
        }),
        group: appearanceGroup,
        keywords: ["light", "theme"],
        icon: <SunIcon className="h-4 w-4" />,
        shortcut: { mod: true, shift: true, key: "l" },
        perform: () => setTheme("light"),
      },
      {
        id: "theme-dark",
        label: intl.formatMessage({
          description: "CommandPaletteController: label - theme dark command",
          defaultMessage: "Theme: Dark",
          id: "5ywSOX",
        }),
        group: appearanceGroup,
        keywords: ["dark", "theme"],
        icon: <MoonIcon className="h-4 w-4" />,
        shortcut: { mod: true, shift: true, key: "k" },
        perform: () => setTheme("dark"),
      },
      {
        id: "theme-midnight",
        label: intl.formatMessage({
          description: "CommandPaletteController: label - theme midnight command, a navy dark theme",
          defaultMessage: "Theme: Midnight",
          id: "LnKMuE",
        }),
        group: appearanceGroup,
        keywords: ["midnight", "navy", "blue", "dark", "theme"],
        icon: <SparklesIcon className="h-4 w-4" />,
        perform: () => setTheme("midnight"),
      },
    ];
  }, [
    intl,
    router,
    navigation,
    setThemeMode,
    navigationGroup,
    appearanceGroup,
    contextsGroup,
    allContextsName,
    contexts,
    setCurrentContext,
    setTag,
    setSmartView,
    setShowSuggestions,
    requestSearchFocus,
  ]);

  useCommandPaletteShortcut();
  useCommandShortcuts(commands);

  return { isOpen, commands, onClose: close };
}
