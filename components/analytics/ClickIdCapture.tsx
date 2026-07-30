"use client";

import { useEffect } from "react";
import { captureClickId } from "@/lib/click-id";

/**
 * Captures the Google Ads click ID on arrival.
 *
 * Rendered in the root layout rather than inside the form, because the ID is
 * only in the URL of the page the visitor *landed* on. Someone who arrives on
 * `/buccal-fat-removal?gclid=…`, reads, and comes back a day later to enquire
 * would otherwise submit with nothing attached — and that is precisely the
 * considered conversion worth the most.
 *
 * Renders nothing and runs once. See `lib/click-id.ts` for why it cannot be
 * added retrospectively.
 */
export function ClickIdCapture() {
  useEffect(() => {
    captureClickId(window.location.search);
  }, []);

  return null;
}
