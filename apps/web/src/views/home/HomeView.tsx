import type { ReactElement } from "react";
import { useIntl } from "react-intl";

export function HomeView(): ReactElement {
  const intl = useIntl();

  return (
    <div className="grid min-h-[60vh] w-full place-items-center px-4 text-center">
      <div className="flex max-w-2xl flex-col items-center gap-4">
        <h1 className="text-4xl font-medium md:text-5xl">
          {intl.formatMessage({
            description: "HomeView: heading - welcome title",
            defaultMessage: "Welcome to Klart",
            id: "W64M8l",
          })}
        </h1>
        <p className="text-default-500 text-lg">
          {intl.formatMessage({
            description: "HomeView: body - getting started copy",
            defaultMessage: "This is your starting point — edit HomeView.tsx to build out your application.",
            id: "fpvDLg",
          })}
        </p>
      </div>
    </div>
  );
}
