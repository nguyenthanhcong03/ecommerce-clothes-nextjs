import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/providers/AuthProvider';
import type { Metadata } from 'next';
import { Geist, Roboto_Mono } from 'next/font/google';
import { cookies } from 'next/headers';
import { ReactQueryProvider } from '../providers/QueryProvider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const robotoNono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'Outfitory - E-commerce Store',
  description: 'Khám phá các sản phẩm thời trang và ưu đãi tuyệt vời tại Outfitory'
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;
  return (
    <html lang='vi'>
      <body className={`${robotoNono.variable} antialiased`}>
        <ReactQueryProvider>
          {/* <DisableScrollRestoration /> */}
          <Toaster />
          <AuthProvider accessToken={accessToken} refreshToken={refreshToken}>
            {children}
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
