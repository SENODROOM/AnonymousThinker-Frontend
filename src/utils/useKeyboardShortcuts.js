import { useEffect } from "react";

// Exported so ProfilePage's Shortcuts tab can display them
export const SHORTCUTS = [
  { label: "New chat", keys: ["Ctrl", "N"], mac: ["⌘", "N"] },
  { label: "Focus input", keys: ["Ctrl", "K"], mac: ["⌘", "K"] },
  { label: "Toggle shortcuts", keys: ["Ctrl", "/"], mac: ["⌘", "/"] },
  { label: "Open profile", keys: ["Ctrl", "Shift", "P"], mac: ["⌘", "⇧", "P"] },
  { label: "Toggle theme", keys: ["Ctrl", "Shift", "D"], mac: ["⌘", "⇧", "D"] },
  { label: "Send message", keys: ["Enter"], mac: ["Enter"] },
  { label: "New line", keys: ["Shift", "Enter"], mac: ["⇧", "Enter"] },
];

/**
 * useKeyboardShortcuts
 * @param {Object} handlers
 *   .onNewChat, .onFocusInput, .onToggleShortcuts, .onOpenProfile, .onToggleTheme
 */
const useKeyboardShortcuts = (handlers = {}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const mod = e.ctrlKey || e.metaKey;

      if (mod && !e.shiftKey && e.key === "n") {
        e.preventDefault();
        handlers.onNewChat?.();
      }
      if (mod && !e.shiftKey && e.key === "k") {
        e.preventDefault();
        handlers.onFocusInput?.();
      }
      if (mod && !e.shiftKey && e.key === "/") {
        e.preventDefault();
        handlers.onToggleShortcuts?.();
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        handlers.onOpenProfile?.();
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        handlers.onToggleTheme?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
};

export default useKeyboardShortcuts;
