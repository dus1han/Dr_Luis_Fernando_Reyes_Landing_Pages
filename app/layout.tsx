import type { Metadata, Viewport } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import Script from "next/script";
import { ClickIdCapture } from "@/components/analytics/ClickIdCapture";
import { MotionProvider } from "@/components/lp/MotionProvider";
import { ANALYTICS, analyticsEnabled } from "@/lib/analytics";
import { SITE } from "@/lib/site";
import { INDEXABLE, ORIGIN } from "@/lib/site-url";
import "./globals.css";

/**
 * Self-hosted via next/font — no render-blocking request to Google and
 * no layout shift when the display face swaps in.
 */
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-playfair",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL(ORIGIN),
  /*
   * `default` is what the root page shows, because a page at the same level
   * as this layout takes the default rather than the template. So `/` is
   * exactly "Dr. Luis Fernando Reyes" — the suffix is not appended to it.
   *
   * The full name, not `doctorShort`. A tab reading "… | Dr. Luis" is a
   * first-name-only credit on a surgeon's ad landing page; the surname is the
   * part someone recognises or searches for later.
   */
  title: {
    default: SITE.doctor,
    template: `%s | ${SITE.doctor}`,
  },
  /*
   * Belt and braces with robots.txt. A URL that is disallowed there can
   * still be *listed* in results if Google finds it linked elsewhere — it
   * just will not be fetched. The meta tag is what actually keeps it out.
   *
   * Derived from the origin, so a preview build cannot be indexed no matter
   * what anyone forgets. See INDEXABLE in lib/site-url.ts.
   */
  robots: { index: INDEXABLE, follow: INDEXABLE },
};

export const viewport: Viewport = {
  themeColor: "#fbf8f4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable}`}>
      <body>
        {/*
          The second half of the GTM snippet, which has to sit immediately
          after the opening <body> tag.

          It does nothing for conversion tracking — without JavaScript there is
          no dataLayer to push to — but it is what Tag Assistant and Google's
          own container checks look for when verifying an installation, and its
          absence is reported as a broken install. Rendered alongside the
          script, so the pair can never drift apart.
        */}
        {ANALYTICS.GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${ANALYTICS.GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        )}

        {/* Captures the Google Ads click ID on arrival, on every route.
            It only exists in the URL the visitor landed on, and it cannot be
            recovered later — see lib/click-id.ts. */}
        <ClickIdCapture />

        <MotionProvider>{children}</MotionProvider>

        {/* Nothing loads until an ID is filled in — see lib/analytics.ts */}
        {analyticsEnabled && ANALYTICS.GTM_ID && (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${ANALYTICS.GTM_ID}');`}
          </Script>
        )}
        {analyticsEnabled && ANALYTICS.GA4_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS.GA4_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ANALYTICS.GA4_ID}');${
                ANALYTICS.ADS_CONVERSION.id
                  ? `gtag('config','${ANALYTICS.ADS_CONVERSION.id}');`
                  : ""
              }`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
