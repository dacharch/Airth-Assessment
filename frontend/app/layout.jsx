import './globals.css';

export const metadata = {
  title: 'Job Queue Dashboard',
  description: 'Mini Job Queue Management Dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
