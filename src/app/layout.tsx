import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SimpleHeader } from "@/components/layout/simple-header";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/components/providers/session-provider";
import { ToastProvider as ToastProviderComponent } from "@/components/ui/toast";
import { QueryClientProvider } from "@/components/providers/query-client-provider";
import { OrganizationStructuredData, LocalBusinessStructuredData } from "@/components/seo/structured-data";
// import { AIChatbot } from "@/components/chat/ai-chatbot";
import { APP_NAME, APP_DESCRIPTION } from "@/constants";
// import { NextIntlClientProvider } from 'next-intl';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://apartmanyvita.sk'),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "apartmány Lučenec",
    "ubytovanie Lučenec",
    "centrum Lučenec",
    "luxusné apartmány",
    "rezervácia ubytovanie",
    "apartmány vita",
    "prenájom apartmán",
  ],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  publisher: APP_NAME,
  openGraph: {
    type: "website",
    locale: "sk_SK",
    url: "https://apartmanyvita.sk",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    images: [
      {
        url: "https://apartmanyvita.sk/og-default.jpg",
        width: 1200,
        height: 630,
        alt: APP_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ["https://apartmanyvita.sk/og-default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code", // Replace with actual code from Google Search Console
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        {/* Structured Data - must be in body for proper rendering */}
        <OrganizationStructuredData />
        <LocalBusinessStructuredData />
        
        <QueryClientProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <SimpleHeader />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            {/* <AIChatbot /> */}
            <ToastProviderComponent />
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
