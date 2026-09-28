"use client";

import { useEffect, useState } from "react";

export default function SavedBanner({
  show,
  message = "✓  Data saved successfully",
}: {
  show: boolean;
  message?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      // Remove ?saved / ?kgen from URL without a page reload
      const url = new URL(window.location.href);
      url.searchParams.delete("saved");
      url.searchParams.delete("kgen");
      window.history.replaceState({}, "", url.pathname);
    }, 3500);
    return () => clearTimeout(t);
  }, [show]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-turf text-bone text-sm font-medium px-5 py-3 shadow-lg"
    >
      <span aria-hidden="true">✓</span>
      {message}
    </div>
  );
}
