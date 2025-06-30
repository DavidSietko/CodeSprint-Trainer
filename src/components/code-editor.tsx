'use client';

import React from "react";
import Editor from "@monaco-editor/react";
import { cn } from "@/lib/utils";

// Define custom theme that matches the application colors
const defineCustomTheme = (monaco: any) => {
  monaco.editor.defineTheme("custom-light", {
    base: "vs",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#faf8fb",
      "editor.foreground": "#1f143a",
      "editor.lineHighlightBackground": "#ebe3f0",
      "editor.selectionBackground": "#5d4b8c4d",
      "editor.inactiveSelectionBackground": "#5d4b8c26",
      "editorLineNumber.foreground": "#483b63",
      "editorLineNumber.activeForeground": "#5d4b8c",
      "editorCursor.foreground": "#5971b8",
      "editor.findMatchBackground": "#5971b84d",
      "editor.findMatchHighlightBackground": "#5971b833",
      "editorWidget.background": "#faf8fb",
      "editorWidget.border": "#e8dceb",
      "editorSuggestWidget.background": "#faf8fb",
      "editorSuggestWidget.border": "#e8dceb",
      "editorSuggestWidget.selectedBackground": "#ebe3f0",
    },
  });

  monaco.editor.defineTheme("custom-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#1a181c",
      "editor.foreground": "#f2f0f2",
      "editor.lineHighlightBackground": "#262429",
      "editor.selectionBackground": "#7967a84d",
      "editor.inactiveSelectionBackground": "#7967a826",
      "editorLineNumber.foreground": "#a199a1",
      "editorLineNumber.activeForeground": "#7967a8",
      "editorCursor.foreground": "#758cc8",
      "editor.findMatchBackground": "#758cc84d",
      "editor.findMatchHighlightBackground": "#758cc833",
      "editorWidget.background": "#1a181c",
      "editorWidget.border": "#333136",
      "editorSuggestWidget.background": "#1a181c",
      "editorSuggestWidget.border": "#333136",
      "editorSuggestWidget.selectedBackground": "#262429",
    },
  });
};

interface CodeEditorProps {
  className?: string;
  language?: string;
  code: string;
  onCodeChange: (code: string) => void;
  disabled?: boolean;
}

export function CodeEditor({
  className,
  language = "javascript",
  code,
  onCodeChange,
  disabled = false,
}: CodeEditorProps) {
  // Detect theme changes and update the editor
  const [theme, setTheme] = React.useState('custom-dark');

  React.useEffect(() => {
    // Observer for class changes on the html element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setTheme(isDark ? 'custom-dark' : 'custom-light');
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true
    });
    
    // Initial check
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'custom-dark' : 'custom-light');

    return () => observer.disconnect();
  }, []);

  // Handle Monaco editor mount
  const handleEditorWillMount = (monaco: any) => {
    defineCustomTheme(monaco);
  };

  const handleCodeChange = (value: string | undefined) => {
    onCodeChange(value || "");
  };

  return (
    <div
      className={cn(
        "w-full h-full rounded-md overflow-hidden",
        className
      )}
    >
      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={handleCodeChange}
        theme={theme}
        beforeMount={handleEditorWillMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'Source Code Pro', monospace",
          lineNumbers: "on",
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly: disabled,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: "on",
          contextmenu: !disabled,
          quickSuggestions: !disabled,
          suggestOnTriggerCharacters: !disabled,
          acceptSuggestionOnEnter: disabled ? "off" : "on",
          folding: true,
          foldingHighlight: true,
          showFoldingControls: "mouseover",
          matchBrackets: "always",
          autoIndent: disabled ? "none" : "full",
          formatOnPaste: !disabled,
          formatOnType: !disabled,
          scrollbar: {
            vertical: "auto",
            horizontal: "auto",
          },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
        }}
      />
    </div>
  );
}
