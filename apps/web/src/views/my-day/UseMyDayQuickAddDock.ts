import { useEffect, useRef, useState, type FocusEvent, type RefObject } from "react";

export interface MyDayQuickAddDock {
  inputRef: RefObject<HTMLInputElement | null>;
  /** The quick-add field has focus, so on phones the keyboard is up. */
  isTyping: boolean;
  onFocus: (event: FocusEvent<HTMLElement>) => void;
  onBlur: (event: FocusEvent<HTMLElement>) => void;
}

/**
 * Tracks whether the phone keyboard is up for the quick-add field, and keeps the field from taking focus when the app
 * opens or comes back from the background, so My Day opens on the tasks rather than the keyboard.
 */
export function useMyDayQuickAddDock(isPhone: boolean): MyDayQuickAddDock {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isPhone) {
      return;
    }
    function release(): void {
      if (document.activeElement === inputRef.current) {
        inputRef.current?.blur();
      }
    }
    function handleVisibility(): void {
      if (document.visibilityState === "hidden") {
        release();
      }
    }
    release();
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pageshow", release);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pageshow", release);
    };
  }, [isPhone]);

  return {
    inputRef,
    isTyping: isPhone && isTyping,
    onFocus: (event) => {
      if (event.target === inputRef.current) {
        setIsTyping(true);
      }
    },
    onBlur: (event) => {
      if (event.target === inputRef.current) {
        setIsTyping(false);
      }
    },
  };
}
