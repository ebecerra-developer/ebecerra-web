"use client";

import { useIsPresentationTool } from "next-sanity/hooks";

export function DisableDraftMode() {
  const isPresentationTool = useIsPresentationTool();
  if (isPresentationTool) return null;

  return (
    <a
      href="/api/draft-mode/disable"
      className="fixed bottom-4 right-4 z-[9999] rounded-full bg-neutral-900 px-4 py-2 text-sm text-white shadow-lg hover:bg-neutral-700"
    >
      Salir de modo borrador
    </a>
  );
}
