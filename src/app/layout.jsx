import '../index.css';

export const metadata = {
  title: 'مركز التسعير الفوري | إدارة المنتجات وقوائم أسعار الشركات',
  description: 'تطبيق ويب متكامل وسريع لإدارة وتسعير المنتجات لـ 10 شركات مع مزامنة سحابية واستيراد إكسل ومساعد ذكاء اصطناعي مدمج',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800;900&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#07090e] text-slate-100 antialiased font-sans selection:bg-amber-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
