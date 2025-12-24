import { Inter } from 'next/font/google';
import './globals.css';
import LayoutClient from './layout-client';
import { AuthProvider } from '@/context/AuthContext';
import ClarityInit from '@/components/ClarityInit';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  metadataBase: new URL('https://satishdhage.com'),
  title: {
    default: 'Mentors Forum - Transform Your Future | Dr. Satish Dhage | SatishDhage',
    template: '%s | Mentors Forum'
  },
  description:
    'Mentors Forum by Dr. Satish Dhage delivers expert mentorship for defense services preparation including NDA, CDS, AFCAT, SSB Interview & UPSC guidance. Transform your career with structured coaching, leadership development & strategic mentorship.',
  keywords: [
    'Mentors Forum',
    'MentorsForum',
    'Satish Dhage',
    'SatishDhage',
    'Dr Satish Dhage',
    'DrSatishDhage',
    'Doctor Satish Dhage',
    'Defence exam coaching',
    'SSB Interview Training',
    'NDA Coaching',
    'CDS Coaching',
    'AFCAT Preparation',
    'UPSC mentoring',
    'Defense services preparation'
  ],
  authors: [{ name: 'Dr. Satish Dhage', url: 'https://satishdhage.com' }],
  creator: 'Dr. Satish Dhage',
  publisher: 'Mentors Forum',
  openGraph: {
    type: 'website',
    url: 'https://satishdhage.com',
    title: 'Mentors Forum | Transform Your Future | Dr Satish Dhage',
    description:
      'India’s premier mentorship ecosystem for Defense Services & SSB Interview preparation by Dr. Satish Dhage.',
    siteName: 'Mentors Forum',
    images: [
      {
        url: '/mentor-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Mentors Forum - Dr. Satish Dhage'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mentors Forum | Dr Satish Dhage | Defense Prep & SSB Interview',
    description:
      'Expert mentorship for NDA, CDS, AFCAT & SSB Interview under Dr. Satish Dhage.',
    images: ['/mentor-banner.jpg'],
    creator: '@mentorsforum'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true }
  },
  alternates: {
    canonical: 'https://satishdhage.com'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Mentors Forum',
              url: 'https://satishdhage.com.in',
              founder: {
                '@type': 'Person',
                name: 'Dr. Satish Dhage',
                jobTitle: 'Founder & Chief Mentor'
              },
              sameAs: [
                'https://facebook.com/',
                'https://instagram.com/',
                'https://linkedin.com/'
              ],
              description:
                'Mentors Forum helps aspirants prepare for NDA, CDS, AFCAT, UPSC & SSB Interview.'
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <ClarityInit />
        <AuthProvider>
          <LayoutClient>{children}</LayoutClient>
        </AuthProvider>
      </body>
    </html>
  );
}
