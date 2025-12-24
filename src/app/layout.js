import { Inter } from 'next/font/google';
import Script from 'next/script'; // Import Script component
import './globals.css';
import LayoutClient from './layout-client';
import { AuthProvider } from '@/context/AuthContext';
import ClarityInit from '@/components/ClarityInit';

const inter = Inter({ subsets: ['latin'] });

// Define base URL once to avoid mismatches
const BASE_URL = 'https://satishdhage.com'; 

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Mentors Forum - Transform Your Future | Dr. Satish Dhage',
    template: '%s | Mentors Forum'
  },
  description: 'Mentors Forum by Dr. Satish Dhage delivers expert mentorship for defense services preparation including NDA, CDS, AFCAT, SSB Interview & UPSC guidance.',
  keywords: ['Mentors Forum', 'Dr Satish Dhage', 'NDA Coaching', 'SSB Interview Training'],
  authors: [{ name: 'Dr. Satish Dhage', url: BASE_URL }],
  // ... rest of your metadata (ensure URLs use BASE_URL)
  alternates: {
    canonical: BASE_URL
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Google Analytics - Optimized Loading */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LKPYL4KSGS"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LKPYL4KSGS');
          `}
        </Script>

        {/* JSON-LD Schema */}
        <Script
          id="json-ld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Mentors Forum',
              url: BASE_URL,
              founder: {
                '@type': 'Person',
                name: 'Dr. Satish Dhage',
                jobTitle: 'Founder & Chief Mentor'
              },
              description: 'Mentors Forum helps aspirants prepare for NDA, CDS, AFCAT, UPSC & SSB Interview.'
            })
          }}
        />

        <ClarityInit />
        <AuthProvider>
          <LayoutClient>{children}</LayoutClient>
        </AuthProvider>
      </body>
    </html>
  );
}