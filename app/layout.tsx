import type { Metadata } from 'next';
import './globals.css';
import { ModalProvider } from '@/components/modals/ModalProvider';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Food For Zot',
  description: 'Your grocery buddy.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-gray-800">
        <Toaster position="top-center" />
        {children}
        <ModalProvider />
      </body>
    </html>
  );
}