"use client";
import { useEffect } from "react";
import { trackWhenReady, type TrackEvent as Ev } from "@/lib/track";

/** Déclenche un événement publicitaire une seule fois (si `onceKey` est fourni, une fois par session). */
export function TrackEvent({ event, params, onceKey }: { event: Ev; params?: Record<string, string | number | boolean>; onceKey?: string }) {
  useEffect(() => {
    if (onceKey) {
      try {
        if (sessionStorage.getItem(`bg_ev_${onceKey}`)) return;
        sessionStorage.setItem(`bg_ev_${onceKey}`, "1");
      } catch {}
    }
    trackWhenReady(event, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
