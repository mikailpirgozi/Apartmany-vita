import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SimpleHeader } from "@/components/layout/simple-header";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/components/providers/session-provider";
import { ToastProvider as ToastProviderComponent } from "@/components/ui/toast";
import { QueryClientProvider } from "@/components/providers/query-client-provider";
import { OrganizationStructuredData, LocalBusinessStructuredData } from "@/components/seo/structured-data";
import { HotelStructuredData } from "@/components/seo/hotel-structured-data";
import { FAQStructuredData } from "@/components/seo/faq-structured-data";
// import { AIChatbot } from "@/components/chat/ai-chatbot";
import { APP_NAME, APP_DESCRIPTION } from "@/constants";
// import { NextIntlClientProvider } from 'next-intl';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://apartmanvita.sk'),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    // Primary keywords (s diakritikou)
    "apartmány Trenčín",
    "apartmán Trenčín",
    "ubytovanie Trenčín",
    "prenájom apartmán Trenčín",
    "apartmány Vita",
    "apartmán Vita Trenčín",
    "ubytovanie v centre Trenčína",
    "luxusné apartmány Trenčín",
    "moderné ubytovanie Trenčín",
    
    // Secondary keywords (bez diakritiky)
    "apartmany Trencin",
    "apartman Trencin",
    "ubytovanie Trencin",
    "prenajom apartman Trencin",
    "apartmany Vita Trencin",
    
    // Long-tail keywords
    "najlepšie apartmány v Trenčíne",
    "apartmán s parkovaním Trenčín",
    "apartmán s kuchynkou Trenčín",
    "víkendové ubytovanie Trenčín",
    "business apartmán Trenčín",
    
    // Branded keywords
    "Apartmán Vita Lite Trenčín",
    "Apartmán Vita Design Trenčín",
    "Apartmán Vita Deluxe Trenčín",
  ],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  publisher: APP_NAME,
  openGraph: {
    type: "website",
    locale: "sk_SK",
    url: "https://apartmanvita.sk",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    images: [
      {
        url: "https://apartmanvita.sk/og-default.jpg",
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
    images: ["https://apartmanvita.sk/og-default.jpg"],
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
    google: "Y6ooJw4Ef1NEhXda6xNGqnHmI8lNsnUVNpZIi71a8Co",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="Y6ooJw4Ef1NEhXda6xNGqnHmI8lNsnUVNpZIi71a8Co" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        {/* Structured Data - must be in body for proper rendering */}
        <OrganizationStructuredData />
        <LocalBusinessStructuredData />
        <HotelStructuredData />
        <FAQStructuredData />
        
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
