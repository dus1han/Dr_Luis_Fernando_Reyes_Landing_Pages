import type { Metadata, Viewport } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import Script from "next/script";
import { MotionProvider } from "@/components/lp/MotionProvider";
import { ANALYTICS, analyticsEnabled } from "@/lib/analytics";
import { SITE } from "@/lib/site";
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
  metadataBase: new URL(SITE.baseUrl),
  title: {
    default: `${SITE.doctor} — ${SITE.practice}, ${SITE.city}`,
    template: `%s | ${SITE.doctorShort}`,
  },
  robots: { index: true, follow: true },
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
