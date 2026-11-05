---
name: add-request-handler
description: Set up the scheduled job that handles Klart "Request file" automations on a chosen platform (macOS launchd, Linux systemd timer or cron, Windows Task Scheduler, or a GitHub Actions workflow in the data repository). It writes a handler script that runs a command for each request in requests/ and deletes the file, plus the scheduler config, and installs it. Use when the user says "add a request handler", "cron job for request files", "handle Klart requests", "watch the requests folder", or wants a Run button in My Day to trigger a script or GitHub Action.
---

# Add a request-file handler

Klart's **Request file** automation (Settings → Agents & files → Automations) doesn't run anything itself. Pressing Run queues `requests/<time>-<name>.json` and the primary sync's next push writes it (with Git or GitHub, committed with that push):

```json
{
  "schema": "klart.request/v1",
  "automation": "Collect work tasks",
  "requestedAt": "2026-11-05T08:15:00.000Z",
  "device": "MacBook Pro"
}
```

Klart never reads `requests/`. This skill sets up the other side: a job that checks the folder on a schedule, runs the command mapped to each automation name, deletes the request, and (for Git) commits and pushes whatever the command wrote, so the app pulls it on its next sync. See "Automations" in `docs/klart.md` and `requests/` in `apps/web/src/core/sync/LlmsTxt.ts`.

## Input

$ARGUMENTS

## Steps

1. **Gather what's missing** from the input. Ask with `AskUserQuestion`, all in one go:
   - **Platform**: macOS (launchd), Linux (systemd timer, or cron without systemd), Windows (Task Scheduler) or GitHub Actions.
   - **Where the data is**: the primary sync's kind and location: a folder (OneDrive, iCloud Drive, Dropbox, any local folder), a Git clone, or a GitHub repository (`owner/repo` and branch, usually `main`). Request files only go to the **primary** sync.
   - **Automations**: each automation's name, exactly as in Klart (the handler matches on it), and the command to run for it.
   - **Interval**: how often to check. Default 2 minutes locally, none for GitHub Actions (the push starts it).

2. **Check the combination** and pick the handler mode (`SYNC`):

   | Klart sync          | Platform              | Mode                                                                     |
   | ------------------- | --------------------- | ------------------------------------------------------------------------ |
   | Folder              | macOS, Linux, Windows | `folder`, on a computer where that folder syncs                          |
   | Git clone or GitHub | GitHub Actions        | `git`, in the data repository; no computer needs to be on                |
   | Git clone or GitHub | macOS, Linux, Windows | `git`, in a **separate clone** at `~/.klart/requests/<id>/repo`          |
   | Folder              | GitHub Actions        | Not possible: suggest a local platform, or moving the sync to Git/GitHub |

   Never point a `git` handler at the clone the Klart desktop app syncs: both would commit, merge and push in the same working tree. Clone the repository again for the handler (`git clone <url> ~/.klart/requests/<id>/repo`), using the remote URL from the user's clone (`git -C <clone> remote get-url origin`).

3. **Pick an id**: a short kebab-case slug for this handler (`work-tasks`, `appgate`). It names the files, lock, log and scheduler entry, so several handlers can live side by side. If one with the same id exists, read it and update it instead of replacing it blindly.

4. **Write the handler** from `templates/` in this skill's folder, replacing every `__PLACEHOLDER__`. Never put handler files in this repository.

   | Platform       | Script                                                   | Log                                               |
   | -------------- | -------------------------------------------------------- | ------------------------------------------------- |
   | macOS, Linux   | `~/.klart/requests/<id>/handle-requests.sh` (`chmod +x`) | `~/.klart/requests/<id>/requests.log`             |
   | Windows        | `%USERPROFILE%\.klart\requests\<id>\handle-requests.ps1` | `%USERPROFILE%\.klart\requests\<id>\requests.log` |
   | GitHub Actions | `.github/klart/handle-requests-<id>.sh` in the data repo | `/dev/stdout` (the run's log)                     |

   Placeholders: `__ID__`, `__KLART_DIR__` (absolute path; `$GITHUB_WORKSPACE` for Actions), `__SYNC__`, `__BRANCH__`, `__LOG_FILE__`, and `__HANDLERS__`, one entry per automation:

   ```sh
       "Collect work tasks") ./scripts/collect-work-tasks.sh ;;
       "Refresh calendar") node ~/bin/calendar-to-klart.mjs && echo done ;;
   ```

   ```powershell
     "Collect work tasks" = { & "$HOME\bin\collect-work-tasks.ps1" }
   ```

   Commands run in the data folder with `KLART_DIR`, `KLART_AUTOMATION`, `KLART_REQUEST` and `KLART_DEVICE` set. The usual job adds tasks the way any agent does (see `LLMS.txt` in the data folder): a `.txt` file in `inbox/` with one quick-add line per task, e.g. `#work #jira fix the login bug`. If the user's command doesn't exist yet, offer to write it next to the handler.

   What the handler does: takes a lock so runs never overlap; in `git` mode fast-forwards to `origin/<branch>` first; groups requests by name so pressing Run twice runs the job once; leaves names it doesn't know for another handler; deletes the requests of a job that succeeded and moves those of a failed one to `requests/failed/` (no retry loop, the user presses Run again); in `git` mode commits everything (`klart: handled requests`) and pushes, rebasing up to 3 times. It exits non-zero when a job failed.

5. **Write the scheduler config.** Installing changes the user's system, so show what will be installed and confirm before running the install commands. If the target platform isn't this computer, write the files and give the commands instead.

   **macOS (launchd)**: `templates/launchd.plist` → `~/Library/LaunchAgents/com.klart.requests.<id>.plist`. `__SCRIPT__` is the script path, `__LOG_DIR__` its folder, `__INTERVAL_SECONDS__` the interval. For `folder` mode, replace the `__WATCH_PATHS__` comment with `<key>WatchPaths</key><array><string><KLART_DIR>/requests</string></array>` so it also runs as soon as a file lands (create `requests/` first; launchd needs it to exist). Otherwise delete the comment.

   ```sh
   plutil -lint ~/Library/LaunchAgents/com.klart.requests.<id>.plist
   launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.klart.requests.<id>.plist
   launchctl kickstart -k gui/$(id -u)/com.klart.requests.<id>   # run now
   launchctl bootout gui/$(id -u)/com.klart.requests.<id>        # uninstall
   ```

   OneDrive and Dropbox (`~/Library/CloudStorage`), iCloud Drive (`~/Library/Mobile Documents`), `~/Documents` and `~/Desktop` are privacy-protected: a launchd job gets "Operation not permitted" there (it shows in `launchd.err`). Tell the user to add `/bin/zsh` under System Settings → Privacy & Security → Full Disk Access, or use a folder outside those.

   **Linux (systemd)**: `templates/klart-requests.service` and `templates/klart-requests.timer` → `~/.config/systemd/user/klart-requests-<id>.service` and `.timer`, with `__SCRIPT__` and `__INTERVAL_MINUTES__`.

   ```sh
   systemctl --user daemon-reload
   systemctl --user enable --now klart-requests-<id>.timer
   systemctl --user start klart-requests-<id>.service   # run now
   journalctl --user -u klart-requests-<id>.service     # systemd's view of the runs
   systemctl --user disable --now klart-requests-<id>.timer   # uninstall
   ```

   User timers stop when the user logs out. To keep them running, `loginctl enable-linger "$USER"`; ask first. Without systemd, add a cron line instead (show it and confirm, then `(crontab -l 2>/dev/null; echo '<line>') | crontab -`):

   ```
   */2 * * * * /bin/bash -lc '/home/<user>/.klart/requests/<id>/handle-requests.sh'
   ```

   **Windows (Task Scheduler)**, in PowerShell:

   ```powershell
   $script = "$env:USERPROFILE\.klart\requests\<id>\handle-requests.ps1"
   $action = New-ScheduledTaskAction -Execute "powershell.exe" `
     -Argument "-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$script`""
   $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 2)
   $settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -StartWhenAvailable
   Register-ScheduledTask -TaskName "Klart requests (<id>)" -Action $action -Trigger $trigger -Settings $settings
   Start-ScheduledTask -TaskName "Klart requests (<id>)"                     # run now
   Unregister-ScheduledTask -TaskName "Klart requests (<id>)" -Confirm:$false # uninstall
   ```

   A console window may flash on each run; that's Windows, not an error.

   **GitHub Actions**: `templates/github-workflow.yml` → `.github/workflows/klart-requests-<id>.yml` in the data repository, next to the script from step 4. The push of a request file starts it. Replace `# __SCHEDULE__` with `schedule: [{ cron: "*/15 * * * *" }]` only if the user wants a fallback (GitHub runs it at most every 5 minutes, often later); otherwise delete it. Put tokens the commands need in `env` as `${{ secrets.NAME }}`, never inline (replacing `# __ENV__`, or deleting it), and give the user the `gh secret set NAME --repo <owner>/<repo>` commands to run. `ubuntu-latest` has `git`, `node`, `python3`, `jq` and `gh`; add setup steps for anything else. Runs on private repositories use the account's Actions minutes.

6. **Test.**
   - **`folder` mode**: with the user's OK (it runs the real command), write a request like the one above to `<KLART_DIR>/requests/<UTC time without : and .>-test.json` with the automation's exact name, run the scheduler's "run now" command, then check that the file is gone and the log says `ok: <name>`.
   - **`git` mode and GitHub Actions**: don't run the handler or push yourself: it commits and pushes to the user's data repository. Leave the files for the user to commit (Actions) and ask them to press Run in Klart, then read the log or `gh run list --repo <owner>/<repo> --workflow klart-requests-<id>.yml`.

7. **Report**: the files written, the scheduler entry and whether it's installed, where the log is, how to run it now and how to uninstall. Remind the user that in Klart the automation must be of kind **Request file**, enabled, named exactly as in the handler, with Automations turned on, and that the app pulls the results on its next sync.
