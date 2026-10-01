import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed, IBM_Plex_Sans_Arabic } from "next/font/google";
import { LocalDataCleanup } from "@/components/shell/LocalDataCleanup";
import { CENTER } from "@/lib/center-info";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

/* الخطوط حسب نظام Industry: Barlow Condensed للعناوين، Barlow للنص والأرقام اللاتينية،
   وIBM Plex Sans Arabic لكل حرف عربي (يأتي بعدهما في كل مجموعة خطوط في globals.css). */
const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-sans-arabic",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: `${CENTER.nameAr} (TD) — ${CENTER.tagline}`,
    template: `%s — ${CENTER.nameAr}`,
  },
  description: CENTER.summary,
  applicationName: CENTER.nameAr,
  openGraph: {
    type: "website",
    locale: "ar_SA",
    siteName: `${CENTER.nameAr} · ${CENTER.nameEn}`,
    title: `${CENTER.nameAr} (TD) — ${CENTER.headline}`,
    description: CENTER.summary,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f3" },
    { media: "(prefers-color-scheme: dark)", color: "#1d2d3d" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${barlow.variable} ${barlowCondensed.variable} ${ibmPlexSansArabic.variable} h-full antialiased`}
    >
      <head>
        {/* يطبّق الوضع المحفوظ قبل أول رسم لتفادي وميض الوضع الخاطئ */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full">
        <LocalDataCleanup />
        {children}
      </body>
    </html>
  );
}
