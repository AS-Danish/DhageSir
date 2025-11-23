import { Inter } from 'next/font/google';
import './globals.css';
import LayoutClient from './layout-client';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Mentors Forum - Transform Your Future',
  description: 'Expert guidance for defense services preparation',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <LayoutClient>
            {children}
          </LayoutClient>
        </AuthProvider>
      </body>
    </html>
  );
}