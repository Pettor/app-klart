import { useEffect, useRef, type ReactElement } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { SearchField as HeroSearchField, Kbd } from "@heroui/react";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  placeholder?: string;
  /** Key that focuses the field, shown as a hint while the field is empty (e.g. `/`). */
  shortcutHint?: string;
  /** Focuses (and selects) the input whenever this value changes; `0`/`undefined` never focuses. */
  focusRequest?: number;
  className?: string;
}

export function SearchField({
  value,
  onChange,
  ariaLabel,
  placeholder,
  shortcutHint,
  focusRequest,
  className,
}: SearchFieldProps): ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);

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
  );
}
