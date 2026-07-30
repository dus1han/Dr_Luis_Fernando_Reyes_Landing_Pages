"use client";

import { useEffect } from "react";
import { LEAD_EVENT, LEAD_FLAG, pushDataLayer } from "@/lib/analytics";

/**
 * Reports the conversion, once.
 *
 * The event must fire on a genuine submission and **never** on a refresh, a
 * back-navigation, a bookmark or a shared link. Google's bidding optimises
 * toward whatever it is told, so every false positive spends the clinic's
 * budget in the wrong direction — inflated conversion counts are worse than
 * no tracking at all.
 *
 * The guard is a one-time `sessionStorage` flag, read and cleared before the
 * push. Deliberately not a query parameter: those survive sharing, so a
 * forwarded thank-you link would report a lead nobody submitted.
 *
 * `form_location` is what lets one GTM container serve every landing page on
 * this subdomain and still report which one produced the enquiry.
 */
export function LeadEvent({ formLocation }: { formLocation: string }) {
  useEffect(() => {
    let submitted = false;

    try {
      submitted = window.sessionStorage.getItem(LEAD_FLAG) === "1";
      // Cleared before the push, not after: if anything below throws, the
      // flag is already gone and a reload cannot fire a second time.
      if (submitted) window.sessionStorage.removeItem(LEAD_FLAG);
    } catch {
      // Storage blocked — private mode, or a locked-down browser. Missing a
      // conversion is recoverable; a false one is not.
      return;
    }

    if (!submitted) return;

    pushDataLayer({
      event: LEAD_EVENT,
      form_name: "consultation_request",
      form_location: formLocation,
    });
  }, [formLocation]);

  return null;
}
