"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { ChatbotWidgetProps } from "@ebecerra/chatbot/client";

// Lazy chunk: el widget no entra en el JS inicial de las demos.
// Ahorra ~25 KiB de JS sin usar para visitantes que no abren el chat.
const ChatbotWidget = dynamic(
  () => import("@ebecerra/chatbot/client").then((m) => m.ChatbotWidget),
  { ssr: false },
);

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

export default function ChatbotLoader(props: ChatbotWidgetProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const w = window as IdleWindow;
    if (typeof w.requestIdleCallback === "function") {
      const id = w.requestIdleCallback(() => setReady(true), { timeout: 2500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(() => setReady(true), 1500);
    return () => window.clearTimeout(t);
  }, []);

  if (!ready) return null;
  return <ChatbotWidget {...props} />;
}
