import type { IntlShape } from "react-intl";
import type { GitHubErrorKind } from "~/core/sync/GitHubBackend";

/** Explains a GitHub sync problem in words the user can act on. */
export function githubErrorText(intl: IntlShape, kind: GitHubErrorKind | undefined): string | null {
  switch (kind) {
    case "unauthorized":
      return intl.formatMessage({
        description: "SettingsGitHub - error when GitHub rejects the access token",
        defaultMessage: "GitHub didn't accept the token. It may be mistyped, expired or revoked.",
        id: "nvu1sp",
      });
    case "not-found":
      return intl.formatMessage({
        description: "SettingsGitHub - error when the repository can't be found",
        defaultMessage:
          "Repository not found. Check the username and repository name, and that the token has access to it.",
        id: "2a1LKp",
      });
    case "forbidden":
      return intl.formatMessage({
        description: "SettingsGitHub - error when the token lacks permission",
        defaultMessage: "The token isn't allowed to do this. Give it read and write access to Contents.",
        id: "JQEDw7",
      });
    case "rate-limited":
      return intl.formatMessage({
        description: "SettingsGitHub - error when GitHub's API rate limit is reached",
        defaultMessage: "GitHub's request limit was reached. Sync resumes automatically in a while.",
        id: "FNAw8I",
      });
    case "conflict":
      return intl.formatMessage({
        description: "SettingsGitHub - error when other devices kept pushing during sync",
        defaultMessage: "Another device kept pushing at the same time. Klart will try again shortly.",
        id: "xi0RiU",
      });
    case "network":
      return intl.formatMessage({
        description: "SettingsGitHub - error when GitHub can't be reached",
        defaultMessage: "Couldn't reach GitHub. Your changes are kept and sync when you're back online.",
        id: "J8QRm9",
      });
    default:
      return null;
  }
}
