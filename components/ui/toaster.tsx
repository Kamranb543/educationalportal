"use client";

import { Toaster as SonnerToaster } from "sonner";
import { resolveColor } from "@/lib/theme";

/** Animated toast host (sonner), themed to the institution accent color. */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      closeButton
      richColors
      toastOptions={{
        style: {
          background: resolveColor("card"),
          color: resolveColor("primary"),
          border: `1px solid ${resolveColor("muted")}`,
        },
      }}
    />
  );
}
