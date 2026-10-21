import type { ReactElement } from "react";
import { Button, Chip, Modal } from "@heroui/react";
import { useIntl } from "react-intl";

export interface WhatsNewItem {
  emoji: string;
  title: string;
  description: string;
}

export interface WhatsNewRelease {
  version: string;
  highlights: WhatsNewItem[];
  fixes: WhatsNewItem[];
}

export interface WhatsNewDialogProps {
  isOpen: boolean;
  appName: string;
  /** Newest first. */
  releases: WhatsNewRelease[];
  onClose: () => void;
}

function WhatsNewEntry({ emoji, title, description }: WhatsNewItem): ReactElement {
  return (
    <li className="flex gap-3">
      <span aria-hidden className="bg-default flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg">
        {emoji}
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-muted text-sm">{description}</span>
      </div>
    </li>
  );
}

export function WhatsNewDialog({ isOpen, appName, releases, onClose }: WhatsNewDialogProps): ReactElement {
  const intl = useIntl();

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Backdrop variant="blur">
        <Modal.Container size="md" scroll="inside">
          <Modal.Dialog data-testid="whats-new">
            <Modal.Header>
              <Modal.Heading>
                {intl.formatMessage(
                  {
                    description: "WhatsNewDialog - heading",
                    defaultMessage: "🎉 What's new in {appName}",
                    id: "mXIq3Z",
                  },
                  { appName }
                )}
              </Modal.Heading>
              <Modal.CloseTrigger />
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-6">
              {releases.map((release) => (
                <section key={release.version} className="flex flex-col gap-4">
                  <Chip size="sm" variant="soft" color="accent" className="self-start">
                    {intl.formatMessage(
                      {
                        description: "WhatsNewDialog - version label above a release's notes",
                        defaultMessage: "Version {version}",
                        id: "fFBFA3",
                      },
                      { version: release.version }
                    )}
                  </Chip>
                  {release.highlights.length > 0 && (
                    <ul className="flex flex-col gap-4">
                      {release.highlights.map((item) => (
                        <WhatsNewEntry key={item.title} {...item} />
                      ))}
                    </ul>
                  )}
                  {release.fixes.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <h3 className="text-muted text-xs font-medium tracking-wide uppercase">
                        {intl.formatMessage({
                          description: "WhatsNewDialog - heading above the list of fixed bugs",
                          defaultMessage: "🐛 Bugs squashed",
                          id: "KAcMYs",
                        })}
                      </h3>
                      <ul className="flex flex-col gap-4">
                        {release.fixes.map((item) => (
                          <WhatsNewEntry key={item.title} {...item} />
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              ))}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onPress={onClose}>
                {intl.formatMessage({
                  description: "WhatsNewDialog - button that closes the dialog",
                  defaultMessage: "Let's go! 🚀",
                  id: "7G5r47",
                })}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
