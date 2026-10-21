import { useEffect, useRef, type ReactElement } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { SearchField as HeroSearchField, Kbd, ListBox } from "@heroui/react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { useTagCompletion } from "./UseTagCompletion";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  placeholder?: string;
  /** Key that focuses the field, shown as a hint while the field is empty (e.g. `/`). */
  shortcutHint?: string;
  /** Focuses (and selects) the input whenever this value changes; `0`/`undefined` never focuses. */
  focusRequest?: number;
  /** Existing tags, offered as completions while a `#tag` is being typed. */
  tags?: string[];
  className?: string;
}

const NO_TAGS: string[] = [];

export function SearchField({
  value,
  onChange,
  ariaLabel,
  placeholder,
  shortcutHint,
  focusRequest,
  tags = NO_TAGS,
  className,
}: SearchFieldProps): ReactElement {
  const intl = useIntl();
  const inputRef = useRef<HTMLInputElement>(null);
  const completion = useTagCompletion(value, onChange, tags);

  useEffect(() => {
    if (!focusRequest) return;
    // Defer a frame so focus lands after an overlay (e.g. the command palette) restores its own focus.
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    return () => cancelAnimationFrame(frame);
  }, [focusRequest]);

  return (
    <div
      className="relative"
      onKeyDownCapture={completion.onKeyDownCapture}
      onFocus={completion.onFocus}
      onBlur={completion.onBlur}
    >
      <HeroSearchField aria-label={ariaLabel} value={value} onChange={onChange} className={className}>
        <HeroSearchField.Group>
          <HeroSearchField.SearchIcon>
            <MagnifyingGlassIcon className="text-default-500 h-4 w-4" />
          </HeroSearchField.SearchIcon>
          <HeroSearchField.Input ref={inputRef} placeholder={placeholder} />
          {shortcutHint && !value && (
            <Kbd aria-hidden className="mr-2 text-xs">
              <Kbd.Content>{shortcutHint}</Kbd.Content>
            </Kbd>
          )}
          <HeroSearchField.ClearButton />
        </HeroSearchField.Group>
      </HeroSearchField>
      {completion.suggestions.length > 0 && (
        <ListBox
          aria-label={intl.formatMessage({
            description: "SearchField - aria-label of the tag suggestions",
            defaultMessage: "Tag suggestions",
            id: "o+kaMG",
          })}
          data-testid="search-field__tag-suggestions"
          selectionMode="none"
          onAction={(key) => {
            completion.select(String(key));
            inputRef.current?.focus();
          }}
          className="bg-overlay absolute inset-x-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-xl p-1 shadow-lg"
        >
          {completion.suggestions.map((tag, index) => (
            <ListBox.Item
              key={tag}
              id={tag}
              textValue={tag}
              data-testid="search-field__tag-suggestion"
              data-active={index === completion.activeIndex || undefined}
              className={clsx(index === completion.activeIndex && "bg-default")}
            >
              <span aria-hidden className="text-muted">
                #
              </span>
              {tag}
            </ListBox.Item>
          ))}
        </ListBox>
      )}
    </div>
  );
}
