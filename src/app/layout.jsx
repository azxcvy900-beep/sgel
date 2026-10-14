import '../index.css';

export const metadata = {
  title: 'سِـجِـلّ | متجر كتب وألغاز المحققين',
  description: 'منصة بيع كتب وروايات ألغاز وقضايا المحققين الرقمية مع حلول تفاعلية وأدلة تدريجية',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cairo:wght@300;400;600;700;900&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <script type="text/javascript" src="https://payhip.com/payhip.js" async></script>
      </head>
      <body className="bg-black text-white antialiased font-sans selection:bg-[#ec1368] selection:text-white">
        {children}
      </body>
    </html>
  );
}
