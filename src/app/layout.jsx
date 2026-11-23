import './globals.css';

export const metadata = {
  title: 'مركز الأسعار | إدارة وتسعير المنتجات',
  description: 'تطبيق تسعير سريع - اختر الشركة والمنتج لعرض السعر فوراً',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
