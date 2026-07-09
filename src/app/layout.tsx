import type { Metadata } from 'next';
import { Inter, Prompt } from 'next/font/google';
import './globals.css';
import DatabaseInit from '@/components/DatabaseInit';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const prompt = Prompt({ weight: ['300', '400', '500', '600', '700'], subsets: ['thai'], variable: '--font-prompt' });

export const metadata: Metadata = {
  title: 'HOBI Cuisine | ร้านอาหารจีน',
  description: 'ระบบสั่งอาหารออนไลน์ ร้านอาหารจีนสูตรต้นตำรับ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${inter.variable} ${prompt.variable}`}>
      <body className="antialiased min-h-screen flex flex-col">
        <DatabaseInit />
        {children}
      </body>
    </html>
  );
}
