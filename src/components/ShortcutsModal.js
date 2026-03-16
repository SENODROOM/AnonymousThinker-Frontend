import React from "react";

const shortcuts = [
  { keys: "Enter", description: "Send message" },
  { keys: "Shift + Enter", description: "New line in message" },
  { keys: "Ctrl + K", description: "Focus input" },
  { keys: "Ctrl + N", description: "New chat" },
  { keys: "Ctrl + /", description: "Toggle shortcuts modal" },
  { keys: "Esc", description: "Close modal / clear input" },
];

const ShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#13131a",
          border: "1px solid rgba(124,58,237,0.3)",
          borderRadius: "16px",
          padding: "2rem",
          maxWidth: "440px",
          width: "90%",
          fontFamily: "'Space Mono', monospace",
          color: "#e2e8f0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1rem", color: "#7c3aed" }}>
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "1.2rem",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {shortcuts.map(({ keys, description }) => (
            <div
              key={keys}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                {description}
              </span>
              <kbd
                style={{
                  background: "rgba(124,58,237,0.1)",
                  border: "1px solid rgba(124,58,237,0.3)",
                  borderRadius: "6px",
                  padding: "0.2rem 0.6rem",
                  fontSize: "0.75rem",
                  color: "#a78bfa",
                  whiteSpace: "nowrap",
                }}
              >
                {keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;
