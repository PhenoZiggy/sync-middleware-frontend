import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Providers } from './providers';
import { AuthProvider } from '@/components/providers/AuthProvider';

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
           <Providers>
             <AuthProvider>
               <SidebarProvider>{children}</SidebarProvider>
             </AuthProvider>
           </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
