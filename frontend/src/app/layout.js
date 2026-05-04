import './globals.css';

export const metadata = {
  itle: "Restaurant POS System",
  description: "Modern restaurant point of sale and management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
