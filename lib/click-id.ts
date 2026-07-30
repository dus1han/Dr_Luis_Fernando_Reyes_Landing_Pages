"use client";

import {
  CLICK_ID_KEY,
  CLICK_ID_PARAMS,
  CLICK_ID_TTL_MS,
  type ClickIdParam,
  type StoredClickId,
} from "./analytics";

/**
 * Google Ads click-ID capture.
 *
 * Nothing on this site consumes the stored value beyond attaching it to the
 * enquiry. It exists so the clinic can later import **offline conversions** —
 * telling Google Ads which enquiries turned into real patients. That is the
 * difference between bidding for form fills and bidding for customers.
 *
 * **It cannot be backfilled.** The click ID only ever exists in the URL the
 * visitor arrived on; if it is not captured then, it is gone, and no amount of
 * later work recovers it. That is why this ships before anything reads it.
 *
 * `localStorage`, not `sessionStorage`: people arrive from an ad, leave, and
 * come back days later to enquire. A session-scoped store loses exactly the
 * considered conversions worth the most.
 */

/** Read from the current URL and persist. Safe to call on every page load. */
export function captureClickId(search: string, now = Date.now()): StoredClickId | null {
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(search);
  } catch {
    return null;
  }

  for (const param of CLICK_ID_PARAMS) {
    const value = params.get(param);
    if (!value) continue;

    const record: StoredClickId = {
      param,
      // Bounded to match the schema's cap, so an absurd URL cannot produce a
      // request the API will reject after the visitor has already submitted.
      value: value.slice(0, 200),
      expires: now + CLICK_ID_TTL_MS,
    };

    try {
      window.localStorage.setItem(CLICK_ID_KEY, JSON.stringify(record));
    } catch {
      // Storage blocked or full. The in-memory return value still reaches the
      // form on this visit, which is the common case anyway.
    }
    return record;
  }

  return null;
}

/**
 * The stored click ID, or null if absent, expired or unreadable.
 *
 * Expiry is enforced on read rather than by a timer: nothing runs while the
 * tab is closed, and a stale record silently attributing a lead to a click
 * from four months ago is worse than no attribution at all.
 */
export function readClickId(now = Date.now()): StoredClickId | null {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(CLICK_ID_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<StoredClickId>;
    if (
      typeof parsed?.value !== "string" ||
      typeof parsed?.expires !== "number" ||
      !CLICK_ID_PARAMS.includes(parsed.param as ClickIdParam)
    ) {
      return null;
    }
    if (parsed.expires <= now) {
      try {
        window.localStorage.removeItem(CLICK_ID_KEY);
      } catch {
        /* nothing further to do */
      }
      return null;
    }
    return parsed as StoredClickId;
  } catch {
    return null;
  }
}
